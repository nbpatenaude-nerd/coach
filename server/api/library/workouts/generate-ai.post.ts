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

const generatedWorkoutSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    type: { type: 'string', enum: ['Ride', 'Run', 'Swim', 'Row', 'Strength'] },
    sport: { type: 'string', enum: ['Cycling', 'Running', 'Swimming', 'Rowing', 'Strength'] },
    category: { type: 'string', enum: ['Workout', 'ActiveRecovery', 'Race', 'Long', 'Intervals'] },
    durationSec: { type: 'integer', description: 'Total duration in seconds' },
    tss: { type: 'integer' },
    workIntensity: { type: 'number' },
    structuredWorkout: {
      type: 'object',
      properties: {
        steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['Warmup', 'Active', 'Recovery', 'Cooldown'] },
              duration: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['Time', 'Distance'] },
                  value: { type: 'integer' }
                }
              },
              target: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['Power', 'HeartRate', 'Pace', 'None'] },
                  value: { type: 'integer', description: 'Target value (e.g. Watts, BPM)' },
                  min: { type: 'integer' },
                  max: { type: 'integer' }
                }
              }
            }
          }
        }
      }
    }
  },
  required: [
    'title',
    'description',
    'type',
    'sport',
    'category',
    'durationSec',
    'structuredWorkout'
  ]
}

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

  const systemInstruction =
    'You are an elite endurance sports coach. Given a user request, design a comprehensive single structured workout. Provide realistic duration and TSS targets. Ensure the steps have valid types (Warmup, Active, Recovery, Cooldown), durations (Time in seconds, Distance in meters), and targets.'

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
