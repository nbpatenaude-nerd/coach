import { requireAuth } from '../../../../utils/auth-guard'
import { prisma } from '../../../../utils/db'
import { checkQuota } from '../../../../utils/quotas/engine'
import { enqueuePlannedWorkoutStructureGeneration } from '../../../../utils/planned-workout-structure-trigger'
import {
  assertPlannedWorkoutAccess,
  shouldBypassAthleteQuota
} from '../../../../utils/coaching-auth'
import { resolveEffectiveTier } from '../../../../../shared/effective-tier'
import { getActivePromotionalGrant } from '../../../../utils/partner-campaigns'
import { getServerSession } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  const authUser = await requireAuth(event, ['workout:write'])
  const viewerId = authUser.id
  const session = (await getServerSession(event)) || (event.context.session as any)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Workout ID is required' })
  }

  const workout = await prisma.plannedWorkout.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      title: true,
      date: true,
      user: {
        select: {
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionPeriodEnd: true,
          trialEndsAt: true,
          isAdmin: true,
          timezone: true
        }
      }
    }
  })

  if (!workout) {
    throw createError({ statusCode: 404, message: 'Planned workout not found' })
  }

  const accessRole = await assertPlannedWorkoutAccess(viewerId, workout.userId)
  const bypassQuota = shouldBypassAthleteQuota({
    accessRole,
    isCoaching: session?.user?.isCoaching,
    originalUserId: session?.user?.originalUserId
  })

  // Quota is against the athlete who owns the workout, unless a coach is acting.
  const quotaUserId = workout.userId
  if (!bypassQuota) {
    try {
      await checkQuota(quotaUserId, 'generate_structured_workout')
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

  const activeGrant = await getActivePromotionalGrant(quotaUserId)
  const effectiveTier = resolveEffectiveTier({
    subscriptionTier: workout.user.subscriptionTier,
    subscriptionStatus: workout.user.subscriptionStatus,
    subscriptionPeriodEnd: workout.user.subscriptionPeriodEnd,
    trialEndsAt: workout.user.trialEndsAt,
    promotionalGrantTier: activeGrant?.tier ?? null
  })

  // Free athletes: generation limited to 4 weeks ahead. Coaches and paid tiers are exempt.
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
          'Structured workout generation is limited to 4 weeks in advance for free users. Please upgrade to unlock longer-range planning.'
      })
    }
  }

  try {
    const queued = await enqueuePlannedWorkoutStructureGeneration({
      userId: workout.userId,
      plannedWorkoutId: id,
      source: 'api',
      quotaCheckedAtEnqueue: true
    })
    if (queued.status !== 'queued') throw new Error(queued.error)

    return {
      success: true,
      message: 'Workout structure generation started',
      runId: queued.runId,
      publicAccessToken: queued.publicAccessToken
    }
  } catch (error: any) {
    console.error('Failed to enqueue structure generation:', error)
    throw createError({
      statusCode: 500,
      message: error?.message || 'Failed to start workout structure generation'
    })
  }
})
