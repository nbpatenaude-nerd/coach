import { getServerSession } from '../../../utils/session'
import { prisma } from '../../../utils/db'
import { sportSettingsRepository } from '../../../utils/repositories/sportSettingsRepository'
import { assessWorkoutSettingsStaleness } from '../../../../shared/workout-settings-staleness'
import { hasActiveStructureGenerationRun } from '../../../utils/structure-generation-run'
import { hasRenderableStructure } from '../../../utils/structured-workout-persistence'
import { assertPlannedWorkoutAccess } from '../../../utils/coaching-auth'

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
    include: {
      completedWorkouts: {
        select: {
          id: true,
          title: true,
          date: true,
          durationSec: true,
          tss: true,
          averageWatts: true,
          normalizedPower: true,
          averageHr: true,
          type: true
        }
      },
      trainingWeek: {
        select: {
          id: true,
          weekNumber: true,
          startDate: true,
          endDate: true,
          focus: true,
          block: {
            select: {
              id: true,
              name: true,
              type: true,
              primaryFocus: true,
              plan: {
                select: {
                  id: true,
                  goal: {
                    select: {
                      id: true,
                      title: true
                    }
                  }
                }
              }
            }
          }
        }
      },
      user: {
        select: { id: true, ftp: true }
      }
    }
  })

  if (!workout) {
    throw createError({ statusCode: 404, message: 'Planned workout not found' })
  }

  await assertPlannedWorkoutAccess(viewerId, workout.userId)

  const ownerFtp = workout.user?.ftp ?? null

  // Fetch most recent LLM usage for feedback
  const llmUsage = await prisma.llmUsage.findFirst({
    where: {
      entityId: id,
      entityType: 'PlannedWorkout',
      success: true
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      feedback: true,
      feedbackText: true
    }
  })

  // Sport settings / FTP always from the athlete who owns the workout
  const sportSettings = await sportSettingsRepository.getForActivityType(
    workout.userId,
    workout.type || ''
  )
  const settingsStaleness = assessWorkoutSettingsStaleness({
    workoutType: workout.type,
    lastGenerationSettingsSnapshot: workout.lastGenerationSettingsSnapshot,
    createdFromSettingsSnapshot: workout.createdFromSettingsSnapshot,
    liveSportSettings: sportSettings,
    liveUserFtp: ownerFtp
  })
  const structureGenerationInFlight = await hasActiveStructureGenerationRun(id)

  const { user: _owner, ...workoutPayload } = workout

  return {
    workout: workoutPayload,
    userFtp: ownerFtp,
    llmUsageId: llmUsage?.id,
    initialFeedback: llmUsage?.feedback,
    initialFeedbackText: llmUsage?.feedbackText,
    sportSettings,
    settingsStaleness,
    structureGenerationInFlight,
    hasRenderableStructure: hasRenderableStructure(workout.structuredWorkout)
  }
})
