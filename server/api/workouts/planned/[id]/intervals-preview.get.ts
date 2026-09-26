import { prisma } from '../../../../utils/db'
import { getServerSession } from '../../../../utils/session'
import { serializeCanonicalForIntervals } from '../../../../utils/canonical-workout-serializer'
import { assertPlannedWorkoutAccess } from '../../../../utils/coaching-auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Workout ID is required' })
  }

  const viewerId = (session.user as any).id

  const workout = await prisma.plannedWorkout.findUnique({
    where: { id },
    include: {
      user: {
        select: { ftp: true }
      }
    }
  })

  if (!workout) {
    throw createError({ statusCode: 404, message: 'Planned workout not found' })
  }
  await assertPlannedWorkoutAccess(viewerId, workout.userId)
  if (!workout.structuredWorkout) {
    return { intervalsDescription: '', hasStructure: false }
  }

  const intervalsDescription = serializeCanonicalForIntervals({
    title: workout.title,
    description: workout.description || '',
    type: workout.type,
    structure: workout.structuredWorkout,
    zoneProfileSnapshot: (workout.structuredWorkout as any)?.zoneProfileSnapshot,
    workout,
    liveUserFtp: workout.user?.ftp
  })
  return { intervalsDescription, hasStructure: true }
})
