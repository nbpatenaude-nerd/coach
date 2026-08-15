import Stripe from 'stripe'

const config = useRuntimeConfig()

// Check if Stripe is configured to avoid startup crashes in self-hosted environments
export const stripe = config.stripeSecretKey
  ? new Stripe(config.stripeSecretKey, {
      apiVersion: '2025-12-15.clover' as any,
      typescript: true
    })
  : (new Proxy(
      {},
      {
        get: (_target, prop) => {
          throw new Error(
            `Stripe is not configured (missing STRIPE_SECRET_KEY). Cannot access stripe.${String(
              prop
            )}`
          )
        }
      }
    ) as unknown as Stripe)

/**
 * Get Stripe price IDs from environment
 */
export function getStripePriceIds() {
  return {
    uncover: {
      phase1: config.stripeUncover1PhasePriceId,
      phase6: config.stripeUncover6PhasePriceId,
      phase12: config.stripeUncover12PhasePriceId
    },
    unlock: {
      phase1: config.stripeUnlock1PhasePriceId,
      phase6: config.stripeUnlock6PhasePriceId,
      phase12: config.stripeUnlock12PhasePriceId
    },
    unleash: {
      phase1: config.stripeUnleash1PhasePriceId,
      phase6: config.stripeUnleash6PhasePriceId,
      phase12: config.stripeUnleash12PhasePriceId
    }
  }
}

/**
 * Get Stripe product IDs from environment
 */
export function getStripeProductIds() {
  return {
    uncover: config.stripeUncoverProductId,
    unlock: config.stripeUnlockProductId,
    unleash: config.stripeUnleashProductId
  }
}
