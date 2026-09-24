import { z } from 'zod/v3'
import { requireAuth } from '../../utils/auth-guard'
import { eventRepository } from '../../utils/repositories/eventRepository'
import { syncEventToIntervals } from '../../utils/intervals-sync'
import { prisma } from '../../utils/db'
import { afterPersonalEventCreated } from '../../utils/community-events'

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
  joinTeamEventId: z.string().min(1).optional().nullable(),
  skipCommunityDedupe: z.boolean().optional(),
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
    description: 'Creates an event for the authenticated user (session or Bearer with goal:write).'
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
  const { joinTeamEventId, skipCommunityDedupe, shareLevel, hideAttendeeNames, ...eventFields } =
    result.data

  try {
    const integration = await prisma.integration.findFirst({
      where: { userId, provider: 'intervals' }
    })

    const initialSyncStatus = integration ? 'PENDING' : 'LOCAL_ONLY'

    // If joining an existing team event, create as private then fold.
    const createIsPublic = joinTeamEventId ? false : eventFields.isPublic

    const newEvent = await eventRepository.create(userId, {
      ...eventFields,
      isPublic: createIsPublic,
      priority: eventFields.priority || null,
      date: new Date(eventFields.date),
      syncStatus: initialSyncStatus
    })

    const community = await afterPersonalEventCreated(userId, newEvent, {
      joinTeamEventId: joinTeamEventId ?? null,
      skipCommunityDedupe: skipCommunityDedupe ?? false,
      shareLevel,
      hideAttendeeNames
    })
    let finalEvent = community.event

    if (integration && finalEvent.id === newEvent.id && !finalEvent.externalId) {
      const syncResult = await syncEventToIntervals('CREATE', finalEvent, userId)

      if (syncResult.synced && syncResult.result?.id) {
        finalEvent = await eventRepository.update(finalEvent.id, userId, {
          externalId: String(syncResult.result.id),
          source: 'intervals',
          syncStatus: 'SYNCED'
        })
      }
    }

    return {
      success: true,
      event: finalEvent,
      community: {
        teamEventId: community.teamEventId,
        linkedRootId: community.linkedRootId,
        deduped: community.deduped
      }
    }
  } catch (error: any) {
    if (error?.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message })
  }
})
