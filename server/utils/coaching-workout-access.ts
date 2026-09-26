import { requireAuth } from './auth-guard'
import { requireCoachAccessToAthlete } from './coaching-auth'
import { workoutRepository } from './repositories/workoutRepository'
import { attachStreamToWorkout } from './repositories/workoutStreamRepository'

export async function requireCoachAthleteWorkout(event: any, athleteId: string, workoutId: string) {
  await requireAuth(event)
  await requireCoachAccessToAthlete(event, athleteId)

  const workoutRecord = await workoutRepository.getById(workoutId, athleteId)
  if (!workoutRecord) {
    throw createError({ statusCode: 404, message: 'Workout not found' })
  }

  return attachStreamToWorkout(workoutRecord)
}
