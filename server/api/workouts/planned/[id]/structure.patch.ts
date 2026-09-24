import { getServerSession } from '../../../../utils/session'
import { applyManualPlannedWorkoutStructureEdit } from '../../../../utils/planned-workout-manual-structure-edit'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Workout ID is required' })
  }

  const body = await readBody(event)
  return await applyManualPlannedWorkoutStructureEdit({
    ownerUserId: session.user.id,
    plannedWorkoutId: id,
    body
  })
})
