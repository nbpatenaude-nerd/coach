import type { H3Event } from 'h3'
import { requireAuth } from './auth-guard'
import { coachingRepository } from './repositories/coachingRepository'

export async function requireCoachAccessToAthlete(
  event: H3Event,
  athleteId: string,
  requiredScopes: string[] = ['coaching:read']
) {
  const coach = await requireAuth(event, requiredScopes)
  const isCoaching = await coachingRepository.checkRelationship(coach.id, athleteId)

  if (!isCoaching) {
    throw createError({
      statusCode: 403,
      message: 'You do not have permission to access this athlete.'
    })
  }

  return coach
}

export type PlannedWorkoutAccessRole = 'owner' | 'coach'

/**
 * Owner or active coach may view/edit an athlete's planned workout detail page.
 * Write routes (structure, generate, adjust) use the same gate so coaches can
 * build workouts from /workouts/planned/:id without Access Denied.
 */
export async function assertPlannedWorkoutAccess(
  viewerId: string,
  workoutOwnerId: string
): Promise<PlannedWorkoutAccessRole> {
  if (viewerId === workoutOwnerId) return 'owner'

  const isCoach = await coachingRepository.checkRelationship(viewerId, workoutOwnerId)
  if (isCoach) return 'coach'

  throw createError({
    statusCode: 403,
    message: 'Access denied'
  })
}
