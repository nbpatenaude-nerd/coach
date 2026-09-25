export type BillingInterval = '1-phase' | '6-phase' | '12-phase'
/** Guild membership uses calendar billing; coaching tiers use training phases. */
export type GuildBillingInterval = 'monthly' | 'annual'
/** UI toggle labels — mapped onto Stripe phase intervals. */
export type UiBillingInterval = GuildBillingInterval | BillingInterval
export type PricingTier = 'free' | 'guild' | 'uncover' | 'unlock' | 'unleash'
export type SupportedCurrency = 'usd' | 'eur'

export interface PricingPlan {
  key: PricingTier
  name: string
  phase1Price: number
  phase6Price: number | null
  phase12Price: number | null
  description: string
  mobileDescription?: string
  features: string[]
  popular: boolean
  stripePriceIds?: {
    phase1?: string
    phase6?: string
    phase12?: string
  }
}

/**
 * Fallback amounts (CAD major units) aligned with Stripe Journey products.
 * Live `/api/stripe/prices` overrides these when price IDs are configured.
 *
 * The Guild: $10/mo or $110 / 52 weeks (annual membership).
 * Uncover: $150 / 4 weeks · $840 / 24 weeks · $1,650 / 48 weeks (1/6/12 phases).
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    key: 'free',
    name: 'Free',
    phase1Price: 0,
    phase6Price: null,
    phase12Price: null,
    description: "The smartest logbook you've ever used.",
    mobileDescription: 'Essential activity tracking and analysis.',
    features: [
      'Unlimited data history',
      'Manual sync mode',
      'On-demand analysis',
      'Quick AI analysis'
    ],
    popular: false
  },
  {
    key: 'guild',
    name: 'The Guild',
    phase1Price: 10,
    phase6Price: null,
    phase12Price: 110,
    description: 'Community membership and the coaching floor.',
    mobileDescription: 'Guild membership — monthly or annual (52 weeks).',
    features: [
      'Guild community access',
      'Weekly check-ins and coach feedback',
      'Training log and analytics',
      'Priority roadmap input'
    ],
    popular: false
  },
  {
    key: 'uncover',
    name: 'Uncover',
    phase1Price: 150,
    phase6Price: 840,
    phase12Price: 1650,
    description: '1–12 phases of coached training foundation.',
    mobileDescription: 'Coached training in 1, 6, or 12 phases.',
    features: [
      'Structured training phases with your coach',
      'Weekly check-ins and video feedback',
      'Automatic sync for workouts and health metrics',
      'Reliable trend tracking and weekly summaries'
    ],
    popular: false
  },
  {
    key: 'unlock',
    name: 'Unlock',
    phase1Price: 225,
    phase6Price: 1260,
    phase12Price: 2475,
    description: 'Deeper periodization and race-focused coaching.',
    mobileDescription: 'Adaptive planning across training phases.',
    features: [
      'Adaptive race strategy and periodized planning',
      'Thoughtful AI-assisted coaching with scenario analysis',
      'Advanced trend intelligence with forecasting'
    ],
    popular: true
  },
  {
    key: 'unleash',
    name: 'Unleash',
    phase1Price: 300,
    phase6Price: 1680,
    phase12Price: 3300,
    description: 'Full-service coaching and Digital Twin support.',
    mobileDescription: 'Elite coached phases end to end.',
    features: [
      'Proactive alerts for readiness and overreaching risk',
      'Fast-lane priority processing and response',
      'Premium access to new models'
    ],
    popular: false
  }
]

/** Map Monthly/Annual UI toggles onto Stripe 1-phase / 12-phase price slots. */
export function toStripeBillingInterval(
  interval: UiBillingInterval | BillingInterval
): BillingInterval {
  if (interval === 'monthly') return '1-phase'
  if (interval === 'annual') return '12-phase'
  return interval
}

/** Interval to bill for a plan: Guild → monthly/annual; coaching → phases. */
export function intervalForPlan(
  plan: PricingPlan | PricingTier,
  guildInterval: GuildBillingInterval,
  phaseInterval: BillingInterval
): UiBillingInterval {
  const key = typeof plan === 'string' ? plan : plan.key
  return key === 'guild' ? guildInterval : phaseInterval
}

/** DB / Stripe webhook tier for a pricing card key. Guild → SUPPORTER. */
export function subscriptionTierForPlan(key: PricingTier): string {
  if (key === 'guild') return 'SUPPORTER'
  return key.toUpperCase()
}

/** Pricing card key for a stored SubscriptionTier value. */
export function planKeyForSubscriptionTier(tier: string | null | undefined): PricingTier {
  const normalized = (tier || 'FREE').toUpperCase()
  if (normalized === 'SUPPORTER') return 'guild'
  if (normalized === 'PRO') return 'unleash'
  const lower = normalized.toLowerCase()
  if (
    lower === 'free' ||
    lower === 'guild' ||
    lower === 'uncover' ||
    lower === 'unlock' ||
    lower === 'unleash'
  ) {
    return lower
  }
  return 'free'
}

/**
 * Real annual saving from two amounts, or null when there is nothing to claim.
 * Treats 12 × 1-phase as a year of phases (48 weeks at 4 weeks/phase).
 */
export function computeSavingsPercent(
  phase1Amount: number | null | undefined,
  phase12Amount: number | null | undefined
): number | null {
  if (!phase1Amount || !phase12Amount || phase1Amount <= 0 || phase12Amount <= 0) return null
  const yearAtPhase1Rate = phase1Amount * 12
  const saving = Math.round(((yearAtPhase1Rate - phase12Amount) / yearAtPhase1Rate) * 100)
  return saving >= 1 && saving < 100 ? saving : null
}

/**
 * Calculate savings percentage for 12-phase (annual) plans
 */
export function calculateAnnualSavings(plan: PricingPlan): number {
  if (!plan.phase12Price) return 0
  const monthlyTotal = plan.phase1Price * 12
  const savings = ((monthlyTotal - plan.phase12Price) / monthlyTotal) * 100
  return Math.round(savings)
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: 'usd' | 'eur' = 'usd'): string {
  const locale = currency === 'eur' ? 'de-DE' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: price % 1 === 0 ? 0 : 2
  }).format(price)
}

/**
 * Get price for a specific interval
 */
export function getPrice(plan: PricingPlan, interval: BillingInterval): number {
  if (interval === '12-phase' && plan.phase12Price) return plan.phase12Price
  if (interval === '6-phase' && plan.phase6Price) return plan.phase6Price
  return plan.phase1Price
}

/** Whether this plan has a selectable price for the interval. */
export function planSupportsInterval(plan: PricingPlan, interval: BillingInterval): boolean {
  if (plan.key === 'free') return interval === '1-phase'
  if (interval === '1-phase') return true
  if (interval === '6-phase') return plan.phase6Price != null
  return plan.phase12Price != null
}

/**
 * Get Stripe price ID for a plan, interval, and currency
 */
export function getStripePriceId(
  plan: PricingPlan,
  interval: UiBillingInterval | BillingInterval,
  _currency: 'usd' | 'eur' = 'usd'
): string | undefined {
  const config = useRuntimeConfig()
  const stripeInterval = toStripeBillingInterval(interval)

  if (plan.key === 'guild') {
    if (stripeInterval === '1-phase') {
      return (
        (config.public.stripeGuildMonthlyPriceId as string) ||
        (config.public.stripeSupporterMonthlyPriceId as string)
      )
    }
    if (stripeInterval === '12-phase') {
      return (
        (config.public.stripeGuild52WeekPriceId as string) ||
        (config.public.stripeSupporterAnnualPriceId as string)
      )
    }
    return undefined
  }

  if (plan.key === 'uncover') {
    if (stripeInterval === '1-phase') return config.public.stripeUncover1PhasePriceId as string
    if (stripeInterval === '6-phase') return config.public.stripeUncover6PhasePriceId as string
    if (stripeInterval === '12-phase') return config.public.stripeUncover12PhasePriceId as string
  }

  if (plan.key === 'unlock') {
    if (stripeInterval === '1-phase') return config.public.stripeUnlock1PhasePriceId as string
    if (stripeInterval === '6-phase') return config.public.stripeUnlock6PhasePriceId as string
    if (stripeInterval === '12-phase') return config.public.stripeUnlock12PhasePriceId as string
  }

  if (plan.key === 'unleash') {
    if (stripeInterval === '1-phase') return config.public.stripeUnleash1PhasePriceId as string
    if (stripeInterval === '6-phase') return config.public.stripeUnleash6PhasePriceId as string
    if (stripeInterval === '12-phase') return config.public.stripeUnleash12PhasePriceId as string
  }

  return undefined
}
