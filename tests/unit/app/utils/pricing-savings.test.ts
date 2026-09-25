import { describe, expect, it } from 'vitest'

import {
  PRICING_PLANS,
  calculateAnnualSavings,
  computeSavingsPercent
} from '../../../../app/utils/pricing'

describe('computeSavingsPercent', () => {
  it('reports the real saving between a 1-phase and a 12-phase price', () => {
    // Guild: 10 x 12 = 120 against 110
    expect(computeSavingsPercent(10, 110)).toBe(8)
    // Uncover: 150 x 12 = 1800 against 1650
    expect(computeSavingsPercent(150, 1650)).toBe(8)
  })

  it('claims nothing when there is no saving to claim', () => {
    expect(computeSavingsPercent(10, 120)).toBeNull() // identical rate
    expect(computeSavingsPercent(10, 130)).toBeNull() // annual costs more
    expect(computeSavingsPercent(null, 89.99)).toBeNull()
    expect(computeSavingsPercent(8.99, null)).toBeNull()
    expect(computeSavingsPercent(0, 89.99)).toBeNull()
  })

  it('never returns the flat 33% the toggle used to hardcode', () => {
    const savings = PRICING_PLANS.filter((plan) => plan.phase12Price).map((plan) =>
      computeSavingsPercent(plan.phase1Price, plan.phase12Price)
    )
    // guild, uncover, unlock, unleash
    expect(savings).toEqual([8, 8, 8, 8])
    expect(savings).not.toContain(33)
  })

  it('agrees with the per-plan helper the cards already used', () => {
    for (const plan of PRICING_PLANS) {
      if (!plan.phase12Price) continue
      expect(computeSavingsPercent(plan.phase1Price, plan.phase12Price)).toBe(
        calculateAnnualSavings(plan)
      )
    }
  })
})
