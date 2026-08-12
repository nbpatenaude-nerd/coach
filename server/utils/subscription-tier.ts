import type Stripe from 'stripe'
import type { SubscriptionTier } from '~/server/utils/generated-prisma/client'
type StripeTierConfig = {
  stripeUncoverProductId?: string
  stripeUncoverMonthlyPriceId?: string
  stripeUncoverAnnualPriceId?: string
  stripeUncoverMonthlyEurPriceId?: string
  stripeUncoverAnnualEurPriceId?: string
  stripeUnlockProductId?: string
  stripeUnlockMonthlyPriceId?: string
  stripeUnlockAnnualPriceId?: string
  stripeUnlockMonthlyEurPriceId?: string
  stripeUnlockAnnualEurPriceId?: string
  stripeUnleashProductId?: string
  stripeUnleashMonthlyPriceId?: string
  stripeUnleashAnnualPriceId?: string
  stripeUnleashMonthlyEurPriceId?: string
  stripeUnleashAnnualEurPriceId?: string
}

export function getPriceProductId(priceProduct: Stripe.Price['product']): string | null {
  if (!priceProduct) return null
  return typeof priceProduct === 'string' ? priceProduct : priceProduct.id
}

function inferTierFromText(value?: string | null): SubscriptionTier | null {
  if (!value) return null

  const normalized = value.trim().toLowerCase()
  if (!normalized) return null

  if (normalized.includes('uncover')) return 'UNCOVER'
  if (normalized.includes('unlock')) return 'UNLOCK'
  if (normalized.includes('unleash')) return 'UNLEASH'

  return null
}

function inferTierFromProduct(product: Stripe.Product | null): SubscriptionTier | null {
  if (!product) return null

  return (
    inferTierFromText(product.metadata?.tier) ||
    inferTierFromText(product.name) ||
    inferTierFromText(product.description)
  )
}

export async function resolveSubscriptionTier(
  item: Stripe.SubscriptionItem | undefined,
  config: StripeTierConfig,
  stripeClient: Stripe
): Promise<SubscriptionTier> {
  const price = item?.price
  const priceId = price?.id
  const productId = getPriceProductId((price?.product as Stripe.Price['product']) ?? null)

  const uncoverPriceIds = [
    config.stripeUncoverMonthlyPriceId,
    config.stripeUncoverAnnualPriceId,
    config.stripeUncoverMonthlyEurPriceId,
    config.stripeUncoverAnnualEurPriceId
  ].filter(Boolean)
  const unlockPriceIds = [
    config.stripeUnlockMonthlyPriceId,
    config.stripeUnlockAnnualPriceId,
    config.stripeUnlockMonthlyEurPriceId,
    config.stripeUnlockAnnualEurPriceId
  ].filter(Boolean)
  const unleashPriceIds = [
    config.stripeUnleashMonthlyPriceId,
    config.stripeUnleashAnnualPriceId,
    config.stripeUnleashMonthlyEurPriceId,
    config.stripeUnleashAnnualEurPriceId
  ].filter(Boolean)

  if (priceId && uncoverPriceIds.includes(priceId)) return 'UNCOVER'
  if (priceId && unlockPriceIds.includes(priceId)) return 'UNLOCK'
  if (priceId && unleashPriceIds.includes(priceId)) return 'UNLEASH'
  if (productId && productId === config.stripeUncoverProductId) return 'UNCOVER'
  if (productId && productId === config.stripeUnlockProductId) return 'UNLOCK'
  if (productId && productId === config.stripeUnleashProductId) return 'UNLEASH'

  const inlineProduct =
    price?.product && typeof price.product !== 'string' ? (price.product as Stripe.Product) : null

  const inferredInlineTier =
    inferTierFromText(price?.lookup_key) ||
    inferTierFromText(price?.nickname) ||
    inferTierFromProduct(inlineProduct)

  if (inferredInlineTier) {
    return inferredInlineTier
  }

  if (productId) {
    const product = await stripeClient.products.retrieve(productId)
    const inferredProductTier = inferTierFromProduct(product)
    if (inferredProductTier) {
      return inferredProductTier
    }
  }

  throw new Error(
    `Unable to resolve subscription tier for price '${priceId || 'unknown'}' product '${productId || 'unknown'}'`
  )
}
