import { z } from 'zod/v3'
import { getServerSession } from '../../utils/session'
import { eventRepository } from '../../utils/repositories/eventRepository'
import { syncEventToIntervals } from '../../utils/intervals-sync'
import { prisma } from '../../utils/db'
import { afterPersonalEventUpdated } from '../../utils/community-events'

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
  shareLevel: z.enum(['FULL', 'SUMMARY']).optional(),
  hideAttendeeNames: z.boolean().optional(),
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

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing event ID' })

  const body = await readBody(event)
  const result = eventSchema.safeParse(body)

  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid input', data: result.error.issues })
  }

  const userId = (session.user as any).id
  const { shareLevel, hideAttendeeNames, ...eventFields } = result.data

  try {
    // 1. Fetch integration
    const integration = await prisma.integration.findFirst({
      where: { userId, provider: 'intervals' }
    })

    // 2. Update local event
    const updatedEvent = await eventRepository.update(id, userId, {
      ...eventFields,
      priority: eventFields.priority || null,
      date: new Date(eventFields.date),
      syncStatus: integration ? 'PENDING' : 'LOCAL_ONLY'
    })

    // 3. Promote / sync Team Calendar when Share on Team Calendar is set
    const community = await afterPersonalEventUpdated(userId, updatedEvent, {
      shareLevel,
      hideAttendeeNames
    })
    let finalEvent = community.event

    // 4. Sync if needed
    if (integration && finalEvent.externalId && finalEvent.source === 'intervals') {
      const syncResult = await syncEventToIntervals('UPDATE', finalEvent, userId)
      if (syncResult.synced) {
        finalEvent = await eventRepository.update(id, userId, {
          syncStatus: 'SYNCED'
        })
      }
    }

    return {
      success: true,
      event: finalEvent,
      community: { teamEventId: community.teamEventId }
    }
  } catch (error: any) {
    if (error.message.includes('Not authorized')) {
      throw createError({ statusCode: 403, message: error.message })
    }
    throw createError({ statusCode: 500, message: error.message })
  }
})
