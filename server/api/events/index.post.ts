import { z } from 'zod/v3'
import { requireAuth } from '../../utils/auth-guard'
import { eventRepository } from '../../utils/repositories/eventRepository'
import { syncEventToIntervals } from '../../utils/intervals-sync'
import { prisma } from '../../utils/db'

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
  startTime: z.string().optional(),
  type: z.string().optional(),
  subType: z.string().optional(),
  priority: z.enum(['A', 'B', 'C']).or(z.literal('')).nullable().optional(),
  isVirtual: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  country: z.string().optional(),
  city: z.string().optional(),
  location: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  distance: z.number().nullable().optional(),
  elevation: z.number().nullable().optional(),
  expectedDuration: z.number().nullable().optional(),
  terrain: z.string().optional(),
  goalIds: z.array(z.string()).optional()
})

defineRouteMeta({
  openAPI: {
    tags: ['Events'],
    summary: 'Create a new racing event',
    description: 'Creates an event for the authenticated user (session or Bearer with goal:write).',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['title', 'date'],
            properties: {
              title: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
              priority: { type: 'string', enum: ['A', 'B', 'C'] },
              isVirtual: { type: 'boolean' },
              isPublic: { type: 'boolean' }
            }
          }
        }
      }
    }
  }
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['goal:write'])

  const body = await readBody(event)
  const result = eventSchema.safeParse(body)

  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid input', data: result.error.issues })
  }

  const userId = user.id

  try {
    // Deduplication Logic
    let existingEvent = null
    if (result.data.isPublic) {
      if (result.data.websiteUrl) {
        existingEvent = await prisma.event.findFirst({
          where: { isPublic: true, websiteUrl: result.data.websiteUrl }
        })
      }

      if (!existingEvent) {
        // Fallback to title and date match
        const eventDate = new Date(result.data.date)
        const startOfDay = new Date(eventDate)
        startOfDay.setUTCHours(0, 0, 0, 0)
        const endOfDay = new Date(eventDate)
        endOfDay.setUTCHours(23, 59, 59, 999)

        existingEvent = await prisma.event.findFirst({
          where: {
            isPublic: true,
            title: { equals: result.data.title, mode: 'insensitive' },
            date: { gte: startOfDay, lte: endOfDay }
          }
        })
      }
    }

    if (existingEvent) {
      // Connect to existing event instead of creating a new one
      const priority = result.data.priority || existingEvent.priority || 'B'
      await prisma.eventParticipant.upsert({
        where: { eventId_userId: { eventId: existingEvent.id, userId } },
        create: { eventId: existingEvent.id, userId, priority },
        update: { priority }
      })

      // Link any goals the user provided
      if (result.data.goalIds && result.data.goalIds.length > 0) {
        // We can't directly use connect on upsert easily without complicated nested writes,
        // but we can update the event to link the goals. However, event goals are shared.
        // We will just connect them to the event itself.
        await prisma.event.update({
          where: { id: existingEvent.id },
          data: {
            goals: {
              connect: result.data.goalIds.map((id) => ({ id }))
            }
          }
        })
      }

      // Sync to Intervals if needed
      const integration = await prisma.integration.findFirst({
        where: { userId, provider: 'intervals' }
      })

      // Fetch the full event to return
      const finalEvent = await prisma.event.findUnique({
        where: { id: existingEvent.id },
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, image: true } } }
          }
        }
      })

      if (finalEvent && integration) {
        // Create a synthetic event object for sync that belongs to the user
        const userParticipant = finalEvent.participants.find((p) => p.userId === userId)
        const eventForSync = {
          ...finalEvent,
          userId,
          priority: userParticipant?.priority || finalEvent.priority
        }
        await syncEventToIntervals('CREATE', eventForSync as any, userId)
      }

      if (finalEvent) {
        const mappedEvent = {
          ...finalEvent,
          priority:
            finalEvent.participants.find((p) => p.userId === userId)?.priority ||
            finalEvent.priority,
          participants: finalEvent.participants.map((p) => ({
            id: p.user.id,
            name: p.user.name,
            image: p.user.image,
            priority: p.priority
          }))
        }
        return { success: true, event: mappedEvent }
      }
    }

    // 1. Determine initial sync status
    const integration = await prisma.integration.findFirst({
      where: { userId, provider: 'intervals' }
    })

    const initialSyncStatus = integration ? 'PENDING' : 'LOCAL_ONLY'

    // 2. Create local event
    const newEvent = await eventRepository.create(userId, {
      ...result.data,
      priority: result.data.priority || null,
      date: new Date(result.data.date),
      syncStatus: initialSyncStatus
    })

    // Also add the creator as an EventParticipant
    await prisma.eventParticipant.create({
      data: {
        eventId: newEvent.id,
        userId: userId,
        priority: result.data.priority || 'B'
      }
    })

    let finalEvent = newEvent

    // 3. Attempt sync if integration exists
    if (integration) {
      const syncResult = await syncEventToIntervals('CREATE', newEvent, userId)

      if (syncResult.synced && syncResult.result?.id) {
        finalEvent = await eventRepository.update(newEvent.id, userId, {
          externalId: String(syncResult.result.id),
          source: 'intervals',
          syncStatus: 'SYNCED'
        })
      }
    }

    return { success: true, event: finalEvent }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message })
  }
})
