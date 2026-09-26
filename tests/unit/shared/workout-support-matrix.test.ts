import { describe, expect, it } from 'vitest'

import {
  destinationAllowsExport,
  getSupportLevel,
  validateCanonicalForDestination
} from '../../../shared/workout-support-matrix'

describe('workout support matrix', () => {
  it('marks run pace as canonical for intervals exports', () => {
    expect(getSupportLevel('run', 'pace', 'intervals')).toBe('canonical')
    expect(destinationAllowsExport('canonical')).toBe(true)
  })

  it('rejects ride pace exports to device formats', () => {
    expect(getSupportLevel('ride', 'pace', 'zwo')).toBe('rejected')
    expect(destinationAllowsExport('rejected')).toBe(false)
  })

  it('allows freeform/display_only steps for FIT and Garmin as open targets', () => {
    expect(getSupportLevel('other', 'freeform', 'fit')).toBe('display_only')
    expect(destinationAllowsExport('display_only', 'fit')).toBe(true)
    expect(destinationAllowsExport('display_only', 'garmin')).toBe(true)
    expect(destinationAllowsExport('display_only', 'mrc')).toBe(false)

    const issues = validateCanonicalForDestination(
      {
        steps: [{ duration: 300, text: 'Easy spin — tech notes only' }]
      },
      'Other',
      'fit'
    )
    expect(issues).toEqual([])
  })

  it('flags unsupported targets during destination validation', () => {
    const issues = validateCanonicalForDestination(
      {
        steps: [{ duration: 600, pace: { metric: 'pace', kind: 'zone', zone: 2 } }]
      },
      'Ride',
      'zwo'
    )
    expect(issues.length).toBeGreaterThan(0)
    expect(issues[0]?.target).toBe('pace')
  })
})
