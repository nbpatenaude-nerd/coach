import type Stripe from 'stripe'
import type { SubscriptionTier } from '#server/utils/generated-prisma/client'
type StripeTierConfig = {
  stripeUncoverProductId?: string
  stripeUncover1PhasePriceId?: string
  stripeUncover6PhasePriceId?: string
  stripeUncover12PhasePriceId?: string
  stripeUnlockProductId?: string
  stripeUnlock1PhasePriceId?: string
  stripeUnlock6PhasePriceId?: string
  stripeUnlock12PhasePriceId?: string
  stripeUnleashProductId?: string
  stripeUnleash1PhasePriceId?: string
  stripeUnleash6PhasePriceId?: string
  stripeUnleash12PhasePriceId?: string
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
    config.stripeUncover1PhasePriceId,
    config.stripeUncover6PhasePriceId,
    config.stripeUncover12PhasePriceId
  ].filter(Boolean)
  const unlockPriceIds = [
    config.stripeUnlock1PhasePriceId,
    config.stripeUnlock6PhasePriceId,
    config.stripeUnlock12PhasePriceId
  ].filter(Boolean)
  const unleashPriceIds = [
    config.stripeUnleash1PhasePriceId,
    config.stripeUnleash6PhasePriceId,
    config.stripeUnleash12PhasePriceId
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
