import { z } from 'zod/v3'
import { requireCoachAthleteWorkout } from '../../../../../../utils/coaching-workout-access'
import { computePowerCurveWindows } from '../../../../../../utils/power-curve'

const paramsSchema = z.object({
  id: z.string(),
  workoutId: z.string()
})

export default defineEventHandler(async (event) => {
  const { id: athleteId, workoutId } = await getValidatedRouterParams(event, paramsSchema.parse)
  const workout = await requireCoachAthleteWorkout(event, athleteId, workoutId)

  if (!workout.streams?.watts) {
    return {
      hasPowerData: false,
      message: 'No power data available for this workout',
      powerCurve: []
    }
  }

  const powerData = workout.streams.watts as number[]
  const timeData = workout.streams.time as number[] | undefined

  if (!Array.isArray(powerData) || powerData.length === 0) {
    return { hasPowerData: false, powerCurve: [] }
  }

  const powerCurve = computePowerCurveWindows(powerData, timeData)
  return {
    hasPowerData: true,
    powerCurve
  }
})
