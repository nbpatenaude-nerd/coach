import { task } from '@trigger.dev/sdk/v3'
import { prisma } from '../server/utils/db'

export const fanoutProgramWorkoutTask = task({
  id: 'fanout-program-workout',
  run: async (payload: {
    programId: string
    workoutId?: string
    targetAthleteId?: string
    mode: 'SINGLE_WORKOUT' | 'SINGLE_WORKOUT_DELETE' | 'INITIAL_SYNC'
  }) => {
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
      // Find all clones of this workout and delete them
      const cloneExternalId = `program_${programId}_workout_${workoutId}`
      await prisma.plannedWorkout.deleteMany({
        where: { externalId: cloneExternalId }
      })
    } else if (mode === 'INITIAL_SYNC' && targetAthleteId) {
      const now = new Date()
      const futureWorkouts = await prisma.plannedWorkout.findMany({
        where: {
          userId: programId,
          date: { gte: now }
        }
      })

      for (const workout of futureWorkouts) {
        await cloneWorkoutForAthlete(workout, targetAthleteId, programId)
      }
    }
  }
})

async function cloneWorkoutForAthlete(masterWorkout: any, athleteId: string, programId: string) {
  const cloneExternalId = `program_${programId}_workout_${masterWorkout.id}`

  const existingClone = await prisma.plannedWorkout.findFirst({
    where: {
      userId: athleteId,
      externalId: cloneExternalId
    }
  })

  const { id, userId, createdAt, updatedAt, externalId, ...dataToClone } = masterWorkout

  if (existingClone) {
    await prisma.plannedWorkout.update({
      where: { id: existingClone.id },
      data: {
        ...dataToClone,
        managedBy: 'PROGRAM'
      }
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
