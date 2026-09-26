import { z } from 'zod/v3'
import { getServerSession } from '../../../../utils/session'
import { enqueuePlannedWorkoutStructureAdjustment } from '../../../../utils/planned-workout-structure-trigger'
import { prisma } from '../../../../utils/db'
import { checkQuota } from '../../../../utils/quotas/engine'
import {
  assertPlannedWorkoutAccess,
  shouldBypassAthleteQuota
} from '../../../../utils/coaching-auth'
import { resolveEffectiveTier } from '../../../../../shared/effective-tier'
import { getActivePromotionalGrant } from '../../../../utils/partner-campaigns'

const adjustSchema = z.object({
  durationMinutes: z.number().optional(),
  intensity: z.string().optional(),
  feedback: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const viewerId = (session.user as any).id
  const workoutId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const adjustments = adjustSchema.parse(body)

  const workout = await prisma.plannedWorkout.findFirst({
    where: { id: workoutId },
    include: {
      user: {
        select: {
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionPeriodEnd: true,
          trialEndsAt: true,
          timezone: true
        }
      }
    }
  })

  if (!workout) {
    throw createError({ statusCode: 404, message: 'Workout not found' })
  }

  const accessRole = await assertPlannedWorkoutAccess(viewerId, workout.userId)
  const bypassQuota = shouldBypassAthleteQuota({
    accessRole,
    isCoaching: (session.user as any)?.isCoaching,
    originalUserId: (session.user as any)?.originalUserId
  })

  if (!bypassQuota) {
    try {
      await checkQuota(workout.userId, 'generate_structured_workout')
    } catch (error: any) {
      if (error.statusCode === 429) {
        throw createError({
          statusCode: 429,
          message: error.message || 'Quota exceeded for structured workout generation.'
        })
      }
      throw error
    }
  }

  const activeGrant = await getActivePromotionalGrant(workout.userId)
  const effectiveTier = resolveEffectiveTier({
    subscriptionTier: workout.user.subscriptionTier,
    subscriptionStatus: workout.user.subscriptionStatus,
    subscriptionPeriodEnd: workout.user.subscriptionPeriodEnd,
    trialEndsAt: workout.user.trialEndsAt,
    promotionalGrantTier: activeGrant?.tier ?? null
  })

  if (!bypassQuota && effectiveTier === 'FREE') {
    const { getUserLocalDate } = await import('../../../../utils/date')
    const timezone = workout.user.timezone || 'UTC'
    const today = getUserLocalDate(timezone)
    const fourWeeksFromNow = new Date(today)
    fourWeeksFromNow.setUTCDate(today.getUTCDate() + 28)

    if (workout.date > fourWeeksFromNow) {
      throw createError({
        statusCode: 403,
        message:
          'Structured workout adjustment is limited to 4 weeks in advance for free users. Please upgrade to unlock longer-range planning.'
      })
    }
  }

  const queued = await enqueuePlannedWorkoutStructureAdjustment({
    userId: workout.userId,
    plannedWorkoutId: workout.id,
    adjustments,
    source: 'api',
    quotaCheckedAtEnqueue: true
  })
  if (queued.status !== 'queued') {
    throw createError({ statusCode: 500, message: queued.error })
  }

  return { success: true, jobId: queued.runId, generationRunId: queued.generationRunId }
})
