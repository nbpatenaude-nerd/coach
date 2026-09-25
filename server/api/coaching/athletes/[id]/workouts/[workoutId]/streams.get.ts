import { z } from 'zod/v3'
import { requireCoachAthleteWorkout } from '../../../../../../utils/coaching-workout-access'
import { detectIntervals, resolveHrWorkThreshold } from '../../../../../../utils/interval-detection'
import { detectClimbs } from '../../../../../../utils/climb-detection'
import { sportSettingsRepository } from '../../../../../../utils/repositories/sportSettingsRepository'

const paramsSchema = z.object({
  id: z.string(),
  workoutId: z.string()
})

export default defineEventHandler(async (event) => {
  const { id: athleteId, workoutId } = await getValidatedRouterParams(event, paramsSchema.parse)
  const workout = await requireCoachAthleteWorkout(event, athleteId, workoutId)

  const streams = (workout.streams || {}) as Record<string, any>
  if (!streams || (!streams.time && !streams.lapSplits)) {
    throw createError({ statusCode: 404, message: 'Workout streams unavailable' })
  }

  const processed = { ...streams, workoutId }

  try {
    const time = Array.isArray(streams.time) ? streams.time : []
    const watts = Array.isArray(streams.watts) ? streams.watts : []
    const heartrate = Array.isArray(streams.heartrate) ? streams.heartrate : []
    const cadence = Array.isArray(streams.cadence) ? streams.cadence : []
    const altitude = Array.isArray(streams.altitude) ? streams.altitude : []
    const distance = Array.isArray(streams.distance) ? streams.distance : []

    if (time.length > 0) {
      const settings = await sportSettingsRepository.getForActivityType(
        athleteId,
        workout.type || 'Ride'
      )
      const hrRefs = settings
        ? { lthr: Number(settings.lthr || 0), maxHr: Number(settings.maxHr || 0) }
        : undefined
      const ftp = Number(settings?.ftp || 0) || undefined

      if (watts.length === time.length) {
        processed.detectedIntervals = detectIntervals(
          time,
          watts,
          'power',
          ftp,
          undefined,
          undefined,
          cadence.length === time.length ? cadence : undefined
        )
      } else if (heartrate.length === time.length) {
        const hrWorkThreshold = resolveHrWorkThreshold(hrRefs || {})
        processed.detectedIntervals = detectIntervals(
          time,
          heartrate,
          'heartrate',
          hrWorkThreshold,
          undefined,
          undefined,
          cadence.length === time.length ? cadence : undefined,
          hrRefs
        )
      }

      if (altitude.length === time.length && distance.length === time.length) {
        processed.detectedClimbs = detectClimbs(time, altitude, distance)
      }
    }
  } catch (error) {
    console.error('[coaching streams] enrichment failed', error)
  }

  return processed
})
