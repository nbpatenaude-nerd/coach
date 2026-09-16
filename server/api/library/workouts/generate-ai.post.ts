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

const stepBaseSchema = z.object({
  type: z.enum(['Warmup', 'Active', 'Recovery', 'Cooldown']),
  duration: z
    .object({
      type: z.enum(['Time', 'Distance']),
      value: z.number()
    })
    .optional(),
  target: z
    .object({
      type: z.enum(['Power', 'HeartRate', 'Pace', 'None']),
      units: z
        .string()
        .describe(
          'Relative units preferred. Power: %FTP or zone (1-7). HR: %LTHR or zone (1-5). Pace: %ThresholdPace or zone (1-6).'
        ),
      value: z.number().describe('Target value based on units (e.g. 90 for 90% FTP, 3 for zone 3)'),
      min: z.number().optional(),
      max: z.number().optional()
    })
    .optional()
})

const generatedWorkoutSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.enum(['Ride', 'Run', 'Swim', 'Row', 'Strength']),
  sport: z.enum(['Cycling', 'Running', 'Swimming', 'Rowing', 'Strength']),
  category: z.enum(['Workout', 'ActiveRecovery', 'Race', 'Long', 'Intervals']),
  durationSec: z.number().describe('Total duration in seconds'),
  tss: z.number().optional(),
  workIntensity: z.number().optional(),
  structuredWorkout: z.object({
    steps: z.array(
      stepBaseSchema.extend({
        reps: z.number().optional().describe('Number of times to repeat the nested steps, if any.'),
        steps: z
          .array(stepBaseSchema)
          .optional()
          .describe('Nested steps to repeat (e.g., for intervals).')
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
  const libraryContext = getLibraryAccessContext(authUser)
  if (ownerScope === 'coach' && !libraryContext.isCoaching) {
    throw createError({
      statusCode: 403,
      message: 'Only coaches can create coach-owned templates.'
    })
  }
  const ownerId = getWritableLibraryOwnerId(libraryContext, ownerScope)

  const systemInstruction = `You are an elite endurance sports coach with expertise in exercise physiology. 
Given a user request, design a comprehensive, realistic single structured workout. 
Follow these principles:
- **Warmup & Cooldown:** Always include an appropriate Warmup (10-20m) and Cooldown (5-15m).
- **Specificity:** Match the workout structure to the requested energy system (e.g., VO2 Max intervals should be 2-5m with 1:1 or 1:0.5 recovery).
- **Target Type:** STRICTLY respect the user's requested target type (Power, HeartRate, Pace). If the user asks for "Pace", "pace zones", or a "track workout", you MUST set target.type to 'Pace'. Do not guess HeartRate if they imply Pace.
- **Intervals/Repeats:** For repeated intervals (e.g. "8x 400m" or "3x 5min"), you MUST use nested steps. Set \`reps\` on the parent step to the number of repeats (e.g. 8), and place the active interval step and the recovery step inside the parent's \`steps\` array.
- **Targets:** Provide realistic target values if the user did not specify them. ALWAYS use relative units. For Power, use '%FTP' or 'zone'. For HeartRate, use '%LTHR' or 'zone'. For Pace, use '%ThresholdPace', 'min/km', 'min/mi', or 'zone'. DO NOT use absolute Watts or BPM. For target ranges, use min and max. Note: if the unit is "zone", you MUST provide a single integer in 'value' (e.g. 2 for Zone 2) and NOT use min/max.
- **TSS & Duration:** Ensure the total TSS and duration accurately reflect the cumulative intensity and time of the steps.
- **Valid Enums:** Strictly adhere to the allowed schema enums.`

  const workoutData = await generateStructuredAnalysis<any>(
    `${systemInstruction}\n\nCreate a structured workout based on this request: ${prompt}`,
    generatedWorkoutSchema,
    'pro',
    { operation: 'generate_workout_template', userId: authUser.id }
  )

  // Map AI's duration format to the app's expected properties
  function mapSteps(steps: any[]): any[] {
    return steps.map((step) => {
      if (step.duration?.type === 'Distance') {
        step.distance = step.duration.value
        step.durationSeconds = 0 // Will be computed dynamically by pace
      } else if (step.duration?.type === 'Time') {
        step.durationSeconds = step.duration.value
        step.distance = 0
      }

      if (step.target) {
        const t = step.target
        const targetObj: any = { units: t.units }
        if (t.min !== undefined && t.max !== undefined) {
          targetObj.range = { start: t.min, end: t.max }
        } else {
          targetObj.value = t.value
        }

        if (t.type === 'Power') {
          step.power = targetObj
          step.primaryTarget = 'power'
        } else if (t.type === 'HeartRate') {
          step.heartRate = targetObj
          step.primaryTarget = 'heartRate'
        } else if (t.type === 'Pace') {
          step.pace = targetObj
          step.primaryTarget = 'pace'
        }
      }

      if (Array.isArray(step.steps)) {
        step.steps = mapSteps(step.steps)
      }
      return step
    })
  }

  if (Array.isArray(workoutData.structuredWorkout?.steps)) {
    workoutData.structuredWorkout.steps = mapSteps(workoutData.structuredWorkout.steps)
  }

  const computedDuration = computeStructuredWorkoutDurationSec(workoutData.structuredWorkout)
  const finalDuration = computedDuration > 0 ? computedDuration : workoutData.durationSec || 3600

  if (validation.data.saveToLibrary) {
    const template = await prisma.workoutTemplate.create({
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
        structuredWorkout: workoutData.structuredWorkout
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
