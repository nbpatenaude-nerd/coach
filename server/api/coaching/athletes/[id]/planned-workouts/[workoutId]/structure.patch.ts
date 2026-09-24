import { z } from 'zod/v3'
import { requireAuth } from '../../../../../../utils/auth-guard'
import { requireCoachAccessToAthlete } from '../../../../../../utils/coaching-auth'
import { applyManualPlannedWorkoutStructureEdit } from '../../../../../../utils/planned-workout-manual-structure-edit'

const paramsSchema = z.object({
  id: z.string(),
  workoutId: z.string()
})

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const { id: athleteId, workoutId } = await getValidatedRouterParams(event, paramsSchema.parse)
  await requireCoachAccessToAthlete(event, athleteId, ['coaching:write'])
  const body = await readBody(event)
  return await applyManualPlannedWorkoutStructureEdit({
    ownerUserId: athleteId,
    plannedWorkoutId: workoutId,
    body
  })
})
