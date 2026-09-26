import type {
  BillingInterval,
  PricingPlan,
  PricingTier,
  SupportedCurrency,
  UiBillingInterval
} from '~/utils/pricing'
import {
  calculateAnnualSavings,
  computeSavingsPercent,
  getPrice,
  toStripeBillingInterval
} from '~/utils/pricing'

type StripePriceInfo = {
  tier: Exclude<PricingTier, 'free'>
  interval: BillingInterval
  currency: SupportedCurrency
  amount: number
  priceId: string
}

/**
 * Prices as Stripe actually bills them, with the bundled constants as fallback.
 *
 * Every price and savings figure shown to an athlete should come from here:
 * hardcoded numbers drift from Stripe, and the same figure re-formatted in
 * another currency is simply wrong when the EUR price object differs.
 */
export function useLivePricing() {
  const { data } = useAsyncData<{ prices: StripePriceInfo[] }>(
    'stripe-prices',
    () => ($fetch as any)('/api/stripe/prices'),
    { lazy: true, default: () => ({ prices: [] }) }
  )

  function findPrice(
    plan: PricingPlan,
    interval: BillingInterval | UiBillingInterval,
    currency: SupportedCurrency
  ): number | null {
    if (plan.key === 'free') return 0
    const stripeInterval = toStripeBillingInterval(interval)
    const match = data.value?.prices?.find(
      (price: StripePriceInfo) =>
        price.tier === plan.key && price.interval === stripeInterval && price.currency === currency
    )
    return match ? match.amount : null
  }

  /** Live amount when Stripe answered, otherwise the bundled constant. */
  function priceFor(
    plan: PricingPlan,
    interval: BillingInterval | UiBillingInterval,
    currency: SupportedCurrency
  ): number {
    const stripeInterval = toStripeBillingInterval(interval)
    return findPrice(plan, stripeInterval, currency) ?? getPrice(plan, stripeInterval)
  }

  function monthlyEquivalent(plan: PricingPlan, currency: SupportedCurrency): number {
    return priceFor(plan, '12-phase', currency) / 12
  }

  /**
   * Real annual (12-phase) saving for this plan, or null when there is nothing
   * to compare against — never claim a discount that isn't in the prices.
   */
  function annualSavings(plan: PricingPlan, currency: SupportedCurrency): number | null {
    const monthly = findPrice(plan, '1-phase', currency)
    const annual = findPrice(plan, '12-phase', currency)
    if (monthly === null || annual === null) {
      const fallback = calculateAnnualSavings(plan)
      return fallback > 0 ? fallback : null
    }
    return computeSavingsPercent(monthly, annual)
  }

  /** Best saving across paid plans — for the interval toggle badge. */
  function bestAnnualSavings(plans: PricingPlan[], currency: SupportedCurrency): number | null {
    const savings = plans
      .filter((plan) => plan.key !== 'free')
      .map((plan) => annualSavings(plan, currency))
      .filter((value): value is number => value !== null)
    return savings.length > 0 ? Math.max(...savings) : null
  }

  return { priceFor, monthlyEquivalent, annualSavings, bestAnnualSavings }
}
