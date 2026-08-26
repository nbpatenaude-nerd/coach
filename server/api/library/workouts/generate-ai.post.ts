import { z } from 'zod'
import { requireAuth } from '../../../utils/auth-guard'
import { prisma } from '../../../utils/db'
import { generateStructuredAnalysis } from '../../../utils/gemini'
import { getWritableLibraryOwnerId, getLibraryAccessContext } from '../../../utils/library-access'
import { computeStructuredWorkoutDurationSec } from '../../../utils/structured-workout-persistence'

const requestSchema = z.object({
  prompt: z.string().min(3),
  ownerScope: z.enum(['athlete', 'coach']).optional().default('athlete'),
  saveToLibrary: z.boolean().optional().default(false)
})

const generatedWorkoutSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.enum(['Ride', 'Run', 'Swim', 'Row', 'Strength']),
  sport: z.enum(['Cycling', 'Running', 'Swimming', 'Rowing', 'Strength']),
  category: z.enum(['Workout', 'ActiveRecovery', 'Race', 'Long', 'Intervals']),
  durationSec: z.number().int().describe('Total duration in seconds'),
  tss: z.number().int().optional(),
  workIntensity: z.number().optional(),
  structuredWorkout: z.object({
    steps: z.array(
      z.object({
        type: z.enum(['Warmup', 'Active', 'Recovery', 'Cooldown']),
        duration: z.object({
          type: z.enum(['Time', 'Distance']),
          value: z.number().int()
        }).optional(),
        target: z.object({
          type: z.enum(['Power', 'HeartRate', 'Pace', 'None']),
          value: z.number().int().describe('Target value (e.g. Watts, BPM)'),
          min: z.number().int().optional(),
          max: z.number().int().optional()
        }).optional()
      })
    )
  })
})

export default defineEventHandler(async (event) => {
  const authUser = await requireAuth(event, ['workout:write'])
  const body = await readBody(event)

  const validation = requestSchema.safeParse(body)
  if (!validation.success) {
    throw createError({ statusCode: 400, message: validation.error.message })
  }

  const { prompt, ownerScope } = validation.data
  const { isCoach } = await getLibraryAccessContext(authUser.id)
  if (ownerScope === 'coach' && !isCoach) {
    throw createError({
      statusCode: 403,
      message: 'Only coaches can create coach-owned templates.'
    })
  }
  const ownerId = getWritableLibraryOwnerId(authUser.id, ownerScope)

  const systemInstruction = `You are an elite endurance sports coach with expertise in exercise physiology. 
Given a user request, design a comprehensive, realistic single structured workout. 
Follow these principles:
- **Warmup & Cooldown:** Always include an appropriate Warmup (10-20m) and Cooldown (5-15m).
- **Specificity:** Match the workout structure to the requested energy system (e.g., VO2 Max intervals should be 2-5m with 1:1 or 1:0.5 recovery).
- **Targets:** Provide realistic target values if the user did not specify them (e.g., sweet spot at 88-93% FTP). For target ranges, use min and max.
- **TSS & Duration:** Ensure the total TSS and duration accurately reflect the cumulative intensity and time of the steps.
- **Valid Enums:** Strictly adhere to the allowed schema enums for step types (Warmup, Active, Recovery, Cooldown), duration (Time, Distance), and targets (Power, HeartRate, Pace, None).`

  const workoutData = await generateStructuredAnalysis<any>(
    `${systemInstruction}\n\nCreate a structured workout based on this request: ${prompt}`,
    generatedWorkoutSchema,
    'flash',
    { operation: 'generate_workout_template', userId: authUser.id }
  )

  const computedDuration = computeStructuredWorkoutDurationSec(workoutData.structuredWorkout)
  const finalDuration = computedDuration > 0 ? computedDuration : workoutData.durationSec || 3600

  if (validation.data.saveToLibrary) {
    const template = await (prisma as any).workoutTemplate.create({
      data: {
        userId: ownerId,
        title: workoutData.title,
        description: workoutData.description,
        type: workoutData.type,
        sport: workoutData.sport,
        category: workoutData.category,
        durationSec: finalDuration,
        tss: workoutData.tss || 50,
        workIntensity: workoutData.workIntensity || 0.7,
        structuredWorkout: workoutData.structuredWorkout,
        source: 'MANUAL',
        isTemplate: true
      }
    })

    return { success: true, template }
  }

  // Otherwise just return the generated data without saving
  return {
    success: true,
    template: {
      title: workoutData.title,
      description: workoutData.description,
      type: workoutData.type,
      sport: workoutData.sport,
      category: workoutData.category,
      durationSec: finalDuration,
      tss: workoutData.tss || 50,
      workIntensity: workoutData.workIntensity || 0.7,
      structuredWorkout: workoutData.structuredWorkout,
      isTemplate: true
    }
  }
})
