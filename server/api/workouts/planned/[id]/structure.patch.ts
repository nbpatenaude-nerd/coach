import { getServerSession } from '../../../../utils/session'
import { prisma } from '../../../../utils/db'
import { applyManualPlannedWorkoutStructureEdit } from '../../../../utils/planned-workout-manual-structure-edit'
import { assertPlannedWorkoutAccess } from '../../../../utils/coaching-auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const viewerId = session.user.id
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Workout ID is required' })
  }

  const workout = await prisma.plannedWorkout.findUnique({
    where: { id },
    select: { id: true, userId: true }
  })
  if (!workout) {
    throw createError({ statusCode: 404, message: 'Planned workout not found' })
  }

  await assertPlannedWorkoutAccess(viewerId, workout.userId)

  const body = await readBody(event)
  return await applyManualPlannedWorkoutStructureEdit({
    ownerUserId: workout.userId,
    plannedWorkoutId: id,
    body
  })
})
