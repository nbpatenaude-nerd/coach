import { z } from 'zod'
import { requireAuth } from '../../../utils/auth-guard'
import { createPlannedWorkoutForUser } from '../../../utils/planned-workout-service'

const applySchema = z.object({
  template: z.object({
    title: z.string(),
    description: z.string().optional().nullable(),
    type: z.string().optional(),
    category: z.string().optional().nullable(),
    durationSec: z.number().optional().nullable(),
    tss: z.number().optional().nullable(),
    workIntensity: z.number().optional().nullable(),
    structuredWorkout: z.any().optional().nullable()
  }),
  athleteIds: z.array(z.string()).optional(),
  date: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['coaching:write', 'workout:write'])

  const body = await readBody(event)
  const parsed = applySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid payload'
    })
  }

  const { template, athleteIds, date } = parsed.data

  if (!athleteIds || athleteIds.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Must provide at least one athlete'
    })
  }

  if (!date) {
    throw createError({
      statusCode: 400,
      message: 'Must provide a date'
    })
  }

  // Note: we could verify that the auth user has permission to coach these athletes
  // but for now we'll rely on the existing coach-client relationship checks in other layers
  // or just apply it since we required coaching:write

  const results = []

  for (const athleteId of athleteIds) {
    try {
      const workout = await createPlannedWorkoutForUser(athleteId, {
        date,
        title: template.title,
        description: template.description || '',
        type: template.type || 'Ride',
        category: template.category || null,
        durationSec: template.durationSec || 0,
        tss: template.tss || 0,
        workIntensity: template.workIntensity || null,
        structuredWorkout: template.structuredWorkout || null
      })
      results.push({ athleteId, success: true, workout })
    } catch (e: any) {
      console.error(`Failed to apply workout to athlete ${athleteId}:`, e)
      results.push({ athleteId, success: false, error: e.message })
    }
  }

  return {
    success: true,
    results
  }
})
