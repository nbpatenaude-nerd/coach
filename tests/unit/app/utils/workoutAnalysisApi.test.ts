import { describe, expect, it } from 'vitest'
import { createWorkoutAnalysisApi } from '../../../../app/utils/workoutAnalysisApi'

describe('createWorkoutAnalysisApi', () => {
  it('builds athlete endpoints', () => {
    const api = createWorkoutAnalysisApi('w1', { kind: 'athlete' })
    expect(api.workout().url).toBe('/api/workouts/w1')
    expect(api.streams()).toBe('/api/workouts/w1/streams')
    expect(api.segmentSummary()).toBe('/api/workouts/w1/segment-summary')
    expect(api.powerCurve()).toBe('/api/workouts/w1/power-curve')
  })

  it('builds coach endpoints under the athlete scope', () => {
    const api = createWorkoutAnalysisApi('w1', { kind: 'coach', athleteId: 'a1' })
    expect(api.workout().url).toBe('/api/coaching/athletes/a1/workouts/w1')
    expect(api.streams()).toBe('/api/coaching/athletes/a1/workouts/w1/streams')
    expect(api.segmentSummary()).toBe('/api/coaching/athletes/a1/workouts/w1/segment-summary')
    expect(api.powerCurve()).toBe('/api/coaching/athletes/a1/workouts/w1/power-curve')
  })
})
