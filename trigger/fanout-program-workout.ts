import { task } from '@trigger.dev/sdk/v3'
import { prisma } from '../server/utils/db'
import { registerTaskHandler } from '../server/utils/task-registry'

type FanoutPayload = {
  programId: string
  workoutId?: string
  targetAthleteId?: string
  mode: 'SINGLE_WORKOUT' | 'SINGLE_WORKOUT_DELETE' | 'INITIAL_SYNC'
}

export async function runFanoutProgramWorkout(payload: FanoutPayload): Promise<void> {
  const { programId, workoutId, targetAthleteId, mode } = payload

  if (mode === 'SINGLE_WORKOUT' && workoutId) {
    const workout = await prisma.plannedWorkout.findUnique({
      where: { id: workoutId }
    })
    if (!workout) return

    const subscribers = await prisma.coachingRelationship.findMany({
      where: { coachId: programId, status: 'ACTIVE' },
      select: { athleteId: true }
    })

    for (const sub of subscribers) {
      await cloneWorkoutForAthlete(workout, sub.athleteId, programId)
    }
  } else if (mode === 'SINGLE_WORKOUT_DELETE' && workoutId) {
    const cloneExternalId = `program_${programId}_workout_${workoutId}`
    await prisma.plannedWorkout.deleteMany({
      where: { externalId: cloneExternalId }
    })
  } else if (mode === 'INITIAL_SYNC' && targetAthleteId) {
    const now = new Date()
    // Backfill 90 days back and all future workouts
    const since = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const workoutsToSync = await prisma.plannedWorkout.findMany({
      where: {
        userId: programId,
        date: { gte: since }
      }
    })

    for (const workout of workoutsToSync) {
      await cloneWorkoutForAthlete(workout, targetAthleteId, programId)
    }
  }
}

// Register with local dispatcher (BullMQ/Redis + inline modes)
registerTaskHandler('fanout-program-workout', runFanoutProgramWorkout)

// Keep Trigger.dev task export for production cloud execution
export const fanoutProgramWorkoutTask = task({
  id: 'fanout-program-workout',
  run: runFanoutProgramWorkout
})

async function cloneWorkoutForAthlete(masterWorkout: any, athleteId: string, programId: string) {
  const cloneExternalId = `program_${programId}_workout_${masterWorkout.id}`

  const existingClone = await prisma.plannedWorkout.findFirst({
    where: { userId: athleteId, externalId: cloneExternalId }
  })

  const { id, userId, createdAt, updatedAt, externalId, ...dataToClone } = masterWorkout

  if (existingClone) {
    await prisma.plannedWorkout.update({
      where: { id: existingClone.id },
      data: { ...dataToClone, managedBy: 'PROGRAM' }
    })
  } else {
    await prisma.plannedWorkout.create({
      data: {
        ...dataToClone,
        userId: athleteId,
        externalId: cloneExternalId,
        managedBy: 'PROGRAM'
      }
    })
  }
}
