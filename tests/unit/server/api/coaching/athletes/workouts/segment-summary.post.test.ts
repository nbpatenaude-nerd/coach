import { beforeEach, describe, expect, it, vi } from 'vitest'

import { requireCoachAthleteWorkout } from '../../../../../../server/utils/coaching-workout-access'
import { calculateSegmentMetricsFromStreams } from '../../../../../../server/utils/analytics/segment-summary'

vi.stubGlobal('defineEventHandler', (fn: any) => fn)
vi.stubGlobal('getValidatedRouterParams', async (event: any, parser: any) =>
  parser({
    id: event.params?.id || 'athlete-1',
    workoutId: event.params?.workoutId || 'workout-1'
  })
)
vi.stubGlobal('readValidatedBody', async (event: any, parser: any) => parser(event.body))
vi.stubGlobal('createError', (err: any) => {
  const error = new Error(err.message || err.statusMessage)
  ;(error as any).statusCode = err.statusCode
  return error
})

vi.mock('../../../../../../server/utils/coaching-workout-access', () => ({
  requireCoachAthleteWorkout: vi.fn()
}))

vi.mock('../../../../../../server/utils/analytics/segment-summary', () => ({
  calculateSegmentMetricsFromStreams: vi.fn()
}))

const getHandler = async () => {
  vi.resetModules()
  const mod =
    await import('../../../../../../server/api/coaching/athletes/[id]/workouts/[workoutId]/segment-summary.post')
  return mod.default
}

describe('POST /api/coaching/athletes/:id/workouts/:workoutId/segment-summary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireCoachAthleteWorkout).mockResolvedValue({
      id: 'workout-1',
      streams: {
        time: [0, 10, 20, 30, 40],
        watts: [100, 110, 120, 130, 140],
        heartrate: [120, 122, 124, 126, 128],
        distance: [0, 50, 100, 150, 200],
        altitude: [10, 11, 12, 13, 14]
      }
    } as any)
    vi.mocked(calculateSegmentMetricsFromStreams).mockReturnValue({
      durationSec: 20,
      averageWatts: 115
    } as any)
  })

  it('calculates segment metrics for a coach-accessible athlete workout', async () => {
    const handler = await getHandler()
    const result = await handler({
      params: { id: 'athlete-1', workoutId: 'workout-1' },
      body: { startTime: 0, endTime: 20 }
    } as any)

    expect(requireCoachAthleteWorkout).toHaveBeenCalled()
    expect(calculateSegmentMetricsFromStreams).toHaveBeenCalled()
    expect(result.durationSec).toBe(20)
  })
})
