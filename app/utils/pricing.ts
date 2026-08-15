export type BillingInterval = '1-phase' | '6-phase' | '12-phase'
export type PricingTier = 'free' | 'uncover' | 'unlock' | 'unleash'
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

export const PRICING_PLANS: PricingPlan[] = [
  {
    key: 'free',
    name: 'Tri Nerds',
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
    key: 'uncover',
    name: 'Uncover',
    phase1Price: 8.99,
    phase6Price: null,
    phase12Price: 89.99,
    description: 'Automated insights for the self-coached athlete.',
    mobileDescription: 'Automated insights and reliable sync.',
    features: [
      'Automatic sync for workouts and health metrics',
      'Always-on AI analysis after new activities',
      'Priority processing during peak usage',
      'Reliable trend tracking and weekly summaries'
    ],
    popular: false
  },
  {
    key: 'unlock',
    name: 'Unlock',
    phase1Price: 14.99,
    phase6Price: null,
    phase12Price: 119.0,
    description: 'Unlock your true potential with detailed planning.',
    mobileDescription: 'Adaptive planning and AI-assisted coaching.',
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
    phase1Price: 24.99,
    phase6Price: null,
    phase12Price: 199.0,
    description: 'Your full-service Digital Twin and Coach.',
    mobileDescription: 'Elite AI-assisted coaching.',
    features: [
      'Proactive alerts for readiness and overreaching risk',
      'Fast-lane priority processing and response',
      'Premium access to new models'
    ],
    popular: false
  }
]

/**
 * Real annual saving from two amounts, or null when there is nothing to claim.
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

/**
 * Get Stripe price ID for a plan, interval, and currency
 */
export function getStripePriceId(
  plan: PricingPlan,
  interval: BillingInterval,
  currency: 'usd' | 'eur' = 'usd'
): string | undefined {
  const config = useRuntimeConfig()

  if (plan.key === 'uncover') {
    if (interval === '1-phase') return config.public.stripeUncover1PhasePriceId as string
    if (interval === '6-phase') return config.public.stripeUncover6PhasePriceId as string
    if (interval === '12-phase') return config.public.stripeUncover12PhasePriceId as string
  }

  if (plan.key === 'unlock') {
    if (interval === '1-phase') return config.public.stripeUnlock1PhasePriceId as string
    if (interval === '6-phase') return config.public.stripeUnlock6PhasePriceId as string
    if (interval === '12-phase') return config.public.stripeUnlock12PhasePriceId as string
  }

  if (plan.key === 'unleash') {
    if (interval === '1-phase') return config.public.stripeUnleash1PhasePriceId as string
    if (interval === '6-phase') return config.public.stripeUnleash6PhasePriceId as string
    if (interval === '12-phase') return config.public.stripeUnleash12PhasePriceId as string
  }

  return undefined
}
