import { requireAuth } from '../../../utils/auth-guard'
import { dispatchTask } from '../../../utils/task-dispatcher'
import { assertQuotaAllowed } from '../../../utils/quotas/http'
import { publishTaskRunStartedEvent } from '../../../utils/task-run-events'

defineRouteMeta({
  openAPI: {
    tags: ['Workouts'],
    summary: 'Analyze workout',
    description: 'Triggers AI analysis for a specific workout.',
    inputSchema: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' }
      }
    ],
    responses: {
      200: {
        description: 'Success',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                workoutId: { type: 'string' },
                jobId: { type: 'string' },
                status: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      },
      401: { description: 'Unauthorized' },
      404: { description: 'Workout not found' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['workout:write'])

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Workout ID is required'
    })
  }

  const userId = user.id
  await assertQuotaAllowed(userId, 'workout_analysis', undefined, event)

  // Fetch the workout
  const workout = await prisma.workout.findFirst({
    where: {
      id
    }
  })

  if (!workout) {
    throw createError({
      statusCode: 404,
      message: 'Workout not found'
    })
  }

  if (workout.userId !== userId) {
    const coachingRepository = await import('../../../utils/repositories/coachingRepository').then(
      (m) => m.coachingRepository
    )
    const isCoach = await coachingRepository.checkRelationship(userId, workout.userId)
    if (!isCoach) {
      throw createError({ statusCode: 403, message: 'Access denied' })
    }
  }

  // Check if already processing (prevent duplicate concurrent analyses)
  if (workout.aiAnalysisStatus === 'PROCESSING') {
    return {
      success: true,
      workoutId: id,
      status: 'PROCESSING',
      message: 'Analysis is currently being generated'
    }
  }

  try {
    // Update status to PENDING
    await workoutRepository.updateStatus(id, 'PENDING')

    // Trigger background job with per-user concurrency
    const handle = await dispatchTask(
      'analyze-workout',
      {
        workoutId: id
      },
      {
        concurrencyKey: user.id,
        tags: [`user:${user.id}`],
        id
      }
    )

    await publishTaskRunStartedEvent(userId, 'analyze-workout', handle)

    return {
      success: true,
      workoutId: id,
      jobId: handle.id,
      status: 'PENDING',
      message: 'Workout analysis started'
    }
  } catch (error) {
    // Update status to failed
    await workoutRepository.updateStatus(id, 'FAILED')

    throw createError({
      statusCode: 500,
      message: `Failed to trigger workout analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
})
