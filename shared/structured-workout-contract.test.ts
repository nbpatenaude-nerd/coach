import { describe, expect, it } from 'vitest'
import {
  createZoneProfileSnapshot,
  adaptStructuredWorkout,
  distanceInputFromMeters,
  formatMpsAsPacePerKm,
  metersFromDistanceInput,
  paceTargetToCanonical,
  paceToMps,
  parsePacePerKmInput,
  validateStructuredWorkoutLimits
} from './structured-workout-contract'

describe('structured workout contract', () => {
  it('resolves relative %pace against a threshold snapshot', () => {
    const snapshot = createZoneProfileSnapshot({ thresholdPace: 3.33, paceZones: [] })
    expect(paceTargetToCanonical({ value: 0.75, units: '%pace' }, snapshot)).toMatchObject({
      target: {
        kind: 'relative',
        relativeToThreshold: { min: 0.75, max: 0.75 },
        units: 'm/s'
      }
    })
  })

  it('converts declared metres per minute to canonical m/s', () => {
    expect(paceToMps(240, 'm/min')).toBe(4)
  })

  it('converts min/km and min/mi inputs to m/s', () => {
    expect(paceToMps(4, 'min/km')).toBeCloseTo(1000 / 240, 6)
    expect(paceToMps(6.5, 'min/mi')).toBeCloseTo(1609.344 / 390, 6)
  })

  it('formats and parses pace editor helpers', () => {
    expect(formatMpsAsPacePerKm(1000 / 240)).toBe('4:00')
    expect(parsePacePerKmInput('4:30')).toBe(4.5)
    expect(parsePacePerKmInput(4.25)).toBe(4.25)
  })

  it('round-trips distance editor units through meters', () => {
    expect(metersFromDistanceInput(1.5, 'km')).toBe(1500)
    expect(metersFromDistanceInput(1, 'mi')).toBe(1609)
    expect(distanceInputFromMeters(1500, 'km')).toBe(1.5)
    expect(distanceInputFromMeters(1609.344, 'mi')).toBe(1)
  })

  it('does not guess an undeclared pace unit', () => {
    expect(paceTargetToCanonical({ value: 240 })).toMatchObject({
      target: null,
      issue: { code: 'invalid_pace_value' }
    })
  })

  it('resolves pace zones against the captured profile snapshot', () => {
    const snapshot = createZoneProfileSnapshot({ paceZones: [{ min: 2.2, max: 2.4, name: 'Z2' }] })
    expect(paceTargetToCanonical({ value: 1, units: 'pace_zone' }, snapshot)).toMatchObject({
      target: { kind: 'zone', zone: 1, rangeMps: { min: 2.2, max: 2.4 } }
    })
  })

  it('rejects pathological repeat expansion', () => {
    expect(
      validateStructuredWorkoutLimits({ steps: [{ reps: 51, steps: [{ durationSeconds: 60 }] }] })
    ).toMatchObject([{ code: 'max_repeat_exceeded' }])
  })

  it('creates a persisted envelope and keeps unknown legacy pace unresolved', () => {
    const structure = adaptStructuredWorkout({ steps: [{ duration: 600, pace: { value: 240 } }] })
    expect(structure).toMatchObject({
      schemaVersion: 1,
      source: 'LEGACY_ADAPTER',
      targetUnits: { pace: 'm/s', duration: 'seconds', distance: 'meters' },
      steps: [{ pace: { kind: 'freeform', unresolved: true } }]
    })
    expect(structure?.diagnostics).toHaveLength(1)
  })

  it('keeps an import zone stable after live settings change', () => {
    const importSnapshot = createZoneProfileSnapshot({ paceZones: [{ min: 3.6, max: 3.9 }] })
    const structure = adaptStructuredWorkout(
      { steps: [{ duration: 600, pace: { value: 1, units: 'pace_zone' } }] },
      { source: 'INTERVALS_IMPORT', zoneProfileSnapshot: importSnapshot }
    )
    expect(structure?.steps[0].pace.rangeMps).toEqual({ min: 3.6, max: 3.9 })
  })

  it('models the production Zone 2 Run pace-zone sequence without magnitude guessing', () => {
    const snapshot = createZoneProfileSnapshot({
      thresholdPace: 2.75,
      paceZones: [
        { min: 3.6, max: 3.9, name: 'Z4' },
        { min: 2.2, max: 2.4, name: 'Z2' },
        { min: 3.6, max: 3.9, name: 'Z4' }
      ]
    })
    const structure = adaptStructuredWorkout(
      {
        steps: [
          { duration: 600, pace: { value: 1, units: 'pace_zone' } },
          { duration: 2400, pace: { value: 2, units: 'pace_zone' } },
          { duration: 600, pace: { value: 1, units: 'pace_zone' } }
        ]
      },
      { source: 'INTERVALS_IMPORT', zoneProfileSnapshot: snapshot }
    )
    expect(structure?.steps.map((step: any) => step.pace.zone)).toEqual([1, 2, 1])
    expect(structure?.steps[1].pace.rangeMps).toEqual({ min: 2.2, max: 2.4 })
    expect(structure?.diagnostics || []).toHaveLength(0)
  })

  it('rejects metres per minute only when the unit is declared', () => {
    expect(paceToMps(240, 'm/min')).toBe(4)
    expect(
      adaptStructuredWorkout({ steps: [{ duration: 600, pace: { value: 240, units: 'm/min' } }] })
        ?.steps[0].pace.rangeMps
    ).toEqual({ min: 4, max: 4 })
  })
})
