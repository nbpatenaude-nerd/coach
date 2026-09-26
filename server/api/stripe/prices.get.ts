import { stripe } from '../../utils/stripe'

type PriceKey = {
  tier: 'guild' | 'uncover' | 'unlock' | 'unleash'
  interval: '1-phase' | '6-phase' | '12-phase'
  currency: 'usd' | 'eur'
  configKey: string
}

export type StripePriceInfo = {
  tier: 'guild' | 'uncover' | 'unlock' | 'unleash'
  interval: '1-phase' | '6-phase' | '12-phase'
  currency: 'usd' | 'eur'
  /** Major units (9.99), so the client never does cent maths. */
  amount: number
  priceId: string
}

function priceKeys(config: Record<string, unknown>): PriceKey[] {
  const keys: PriceKey[] = [
    {
      tier: 'guild',
      interval: '1-phase',
      currency: 'usd',
      configKey: 'stripeGuildMonthlyPriceId'
    },
    {
      tier: 'guild',
      interval: '12-phase',
      currency: 'usd',
      configKey: 'stripeGuild52WeekPriceId'
    },
    {
      tier: 'uncover',
      interval: '1-phase',
      currency: 'usd',
      configKey: 'stripeUncover1PhasePriceId'
    },
    {
      tier: 'uncover',
      interval: '6-phase',
      currency: 'usd',
      configKey: 'stripeUncover6PhasePriceId'
    },
    {
      tier: 'uncover',
      interval: '12-phase',
      currency: 'usd',
      configKey: 'stripeUncover12PhasePriceId'
    },
    {
      tier: 'unlock',
      interval: '1-phase',
      currency: 'usd',
      configKey: 'stripeUnlock1PhasePriceId'
    },
    {
      tier: 'unlock',
      interval: '6-phase',
      currency: 'usd',
      configKey: 'stripeUnlock6PhasePriceId'
    },
    {
      tier: 'unlock',
      interval: '12-phase',
      currency: 'usd',
      configKey: 'stripeUnlock12PhasePriceId'
    },
    {
      tier: 'unleash',
      interval: '1-phase',
      currency: 'usd',
      configKey: 'stripeUnleash1PhasePriceId'
    },
    {
      tier: 'unleash',
      interval: '6-phase',
      currency: 'usd',
      configKey: 'stripeUnleash6PhasePriceId'
    },
    {
      tier: 'unleash',
      interval: '12-phase',
      currency: 'usd',
      configKey: 'stripeUnleash12PhasePriceId'
    }
  ]

  return keys.filter((key) => {
    const primary = config[key.configKey]
    if (typeof primary === 'string' && primary) return true
    // Guild can fall back to legacy Supporter price IDs.
    if (key.tier === 'guild' && key.interval === '1-phase') {
      return Boolean(config.stripeSupporterMonthlyPriceId)
    }
    if (key.tier === 'guild' && key.interval === '12-phase') {
      return Boolean(config.stripeSupporterAnnualPriceId)
    }
    return false
  })
}

function resolvePriceId(config: Record<string, unknown>, key: PriceKey): string {
  const primary = String(config[key.configKey] || '')
  if (primary) return primary
  if (key.tier === 'guild' && key.interval === '1-phase') {
    return String(config.stripeSupporterMonthlyPriceId || '')
  }
  if (key.tier === 'guild' && key.interval === '12-phase') {
    return String(config.stripeSupporterAnnualPriceId || '')
  }
  return ''
}

/**
 * Live price amounts for the configured Stripe price IDs.
 *
 * Cached for an hour: prices change rarely and this is on the public landing.
 */
export default defineCachedEventHandler(
  async (): Promise<{ prices: StripePriceInfo[] }> => {
    const config = useRuntimeConfig() as Record<string, unknown>
    const keys = priceKeys(config)
    if (!keys.length || !config.stripeSecretKey) {
      return { prices: [] }
    }

    const prices: StripePriceInfo[] = []
    await Promise.all(
      keys.map(async (key) => {
        const priceId = resolvePriceId(config, key)
        if (!priceId) return
        try {
          const price = await stripe.prices.retrieve(priceId)
          if (typeof price.unit_amount !== 'number') return
          prices.push({
            tier: key.tier,
            interval: key.interval,
            currency: (price.currency?.toLowerCase() === 'eur' ? 'eur' : 'usd') as 'usd' | 'eur',
            amount: price.unit_amount / 100,
            priceId
          })
        } catch {
          /* skip missing/invalid price ids */
        }
      })
    )

    return { prices }
  },
  { maxAge: 60 * 60, name: 'stripe-prices', getKey: () => 'all' }
)
