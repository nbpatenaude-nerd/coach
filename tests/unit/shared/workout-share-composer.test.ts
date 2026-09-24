import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SHARE_METRICS,
  MAX_SHARE_METRICS,
  normalizeShareLogoId,
  normalizeShareMetrics,
  sportDefaultMetrics
} from '../../../shared/workout-share-composer'
import {
  buildShareMetricLayout,
  formatShareMetric
} from '../../../server/utils/sharing/share-metrics'

describe('workout-share-composer', () => {
  it('normalizes logo ids and falls back to wordmark', () => {
    expect(normalizeShareLogoId('lockup')).toBe('lockup')
    expect(normalizeShareLogoId('nope')).toBe('wordmark')
  })

  it('parses metric lists and caps at max', () => {
    const metrics = normalizeShareMetrics('distance,avgPower,maxPower,avgHr,maxHr,tss,kj')
    expect(metrics).toHaveLength(MAX_SHARE_METRICS)
    expect(metrics[0]).toBe('distance')
  })

  it('falls back to defaults for empty input', () => {
    expect(normalizeShareMetrics('')).toEqual(DEFAULT_SHARE_METRICS)
  })

  it('picks sport-aware defaults', () => {
    expect(sportDefaultMetrics('VirtualRide')).toContain('avgPower')
    expect(sportDefaultMetrics('Run')).toContain('avgPace')
  })
})

describe('share-metrics formatting', () => {
  const workout = {
    title: 'Morning ride',
    type: 'Ride',
    date: new Date('2026-01-01'),
    durationSec: 3600,
    distanceMeters: 42000,
    averageWatts: 210,
    maxWatts: 780,
    averageHr: 148,
    maxHr: 172,
    averageSpeed: 11.67,
    elevationGain: 540,
    tss: 95,
    kilojoules: 760
  }

  it('formats core metrics', () => {
    expect(formatShareMetric(workout, 'maxPower')).toEqual({
      id: 'maxPower',
      label: 'Max Power',
      value: '780',
      unit: 'W'
    })
    expect(formatShareMetric(workout, 'duration')?.value).toBe('1:00:00')
  })

  it('builds hero + secondary layout', () => {
    const layout = buildShareMetricLayout(workout, ['avgPower', 'distance', 'maxPower', 'avgHr'])
    expect(layout.hero?.id).toBe('distance')
    expect(layout.stats.map((s) => s.id)).toEqual(['avgPower', 'maxPower', 'avgHr'])
  })
})
