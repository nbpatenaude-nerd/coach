import type { SubscriptionStatus, SubscriptionTier } from '~~/server/utils/generated-prisma/client'

export type EffectiveTierSource = 'FREE' | 'TRIAL' | 'SUBSCRIPTION' | 'PROMOTIONAL'

export type EffectiveTierInput = {
  subscriptionTier: SubscriptionTier
  subscriptionStatus: SubscriptionStatus
  subscriptionPeriodEnd: Date | null
  trialEndsAt?: Date | null
  promotionalGrantTier?: SubscriptionTier | null
  now?: Date
}

const TIER_RANK: Record<SubscriptionTier, number> = {
  FREE: 0,
  UNCOVER: 1,
  UNLOCK: 2,
  UNLEASH: 3
}

export function maxSubscriptionTier(
  left: SubscriptionTier,
  right: SubscriptionTier
): SubscriptionTier {
  return (TIER_RANK[left] ?? 0) >= (TIER_RANK[right] ?? 0) ? left : right
}

export function resolveEffectiveTier(input: EffectiveTierInput): SubscriptionTier {
  const now = input.now ?? new Date()
  const periodEnd = input.subscriptionPeriodEnd
    ? new Date(input.subscriptionPeriodEnd)
    : new Date(0)

  const isContributor = input.subscriptionStatus === 'CONTRIBUTOR'
  const isEffectivePremium =
    input.subscriptionStatus === 'ACTIVE' ||
    isContributor ||
    Boolean(input.subscriptionPeriodEnd && now < periodEnd)

  let effectiveTier: SubscriptionTier = 'FREE'

  if (isContributor) {
    effectiveTier = 'UNLEASH'
  } else if (isEffectivePremium) {
    effectiveTier = input.subscriptionTier
  }

  const isTrialActive = Boolean(
    input.trialEndsAt && new Date(input.trialEndsAt) > now && input.subscriptionTier === 'FREE'
  )
  if (isTrialActive && !isEffectivePremium) {
    effectiveTier = maxSubscriptionTier(effectiveTier, 'UNLEASH')
  }

  if (input.promotionalGrantTier) {
    effectiveTier = maxSubscriptionTier(effectiveTier, input.promotionalGrantTier)
  }

  return effectiveTier
}
