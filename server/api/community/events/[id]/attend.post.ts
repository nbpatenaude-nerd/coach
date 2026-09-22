import { z } from 'zod'
import { requireAuth } from '../../../../utils/auth-guard'
import { joinTeamEvent, leaveTeamEvent } from '../../../../utils/community-events'

/**
 * Add / remove Team Calendar attendance.
 * `id` is the TeamEvent id. Attending clones onto the athlete's personal calendar.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const eventId = getRouterParam(event, 'id')

  if (!eventId) {
    throw createError({ statusCode: 400, message: 'Event ID is required' })
  }

  const body = await readValidatedBody(
    event,
    z.object({
      attending: z.boolean(),
      priority: z.enum(['A', 'B', 'C']).optional().nullable()
    }).parse
  )

  try {
    if (body.attending) {
      return await joinTeamEvent(user.id, eventId, { priority: body.priority })
    }
    return await leaveTeamEvent(user.id, eventId)
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Error updating event attendance:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update attendance'
    })
  }
})
