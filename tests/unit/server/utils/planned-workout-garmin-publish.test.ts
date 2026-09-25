import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  maybeAutoPublishPlannedWorkoutToGarmin,
  publishPlannedWorkoutToGarmin
} from '../../../../server/utils/planned-workout-garmin-publish'

const {
  mockFindUnique,
  mockIntegrationFindFirst,
  mockIntegrationUpdate,
  mockPublishRepoGet,
  mockPublishRepoUpsert,
  mockSerializeGarmin,
  mockCreateWorkout,
  mockUpdateWorkout,
  mockCreateSchedule,
  mockUpdateSchedule,
  mockHasPermission,
  mockParseScope,
  mockLoadContext
} = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockIntegrationFindFirst: vi.fn(),
  mockIntegrationUpdate: vi.fn(),
  mockPublishRepoGet: vi.fn(),
  mockPublishRepoUpsert: vi.fn(),
  mockSerializeGarmin: vi.fn(),
  mockCreateWorkout: vi.fn(),
  mockUpdateWorkout: vi.fn(),
  mockCreateSchedule: vi.fn(),
  mockUpdateSchedule: vi.fn(),
  mockHasPermission: vi.fn(),
  mockParseScope: vi.fn(),
  mockLoadContext: vi.fn()
}))

vi.mock('../../../../server/utils/db', () => ({
  prisma: {
    plannedWorkout: { findUnique: mockFindUnique },
    integration: {
      findFirst: mockIntegrationFindFirst,
      update: mockIntegrationUpdate
    }
  }
}))

vi.mock('../../../../server/utils/repositories/plannedWorkoutPublishRepository', () => ({
  plannedWorkoutPublishRepository: {
    getByProvider: mockPublishRepoGet,
    upsert: mockPublishRepoUpsert
  }
}))

vi.mock('../../../../server/utils/canonical-workout-serializer', () => ({
  serializeCanonicalForGarmin: mockSerializeGarmin
}))

vi.mock('../../../../server/utils/garmin-push', () => ({
  createGarminWorkout: mockCreateWorkout,
  updateGarminWorkout: mockUpdateWorkout,
  createGarminWorkoutSchedule: mockCreateSchedule,
  updateGarminWorkoutSchedule: mockUpdateSchedule,
  extractGarminScheduleId: () => 'sched-1',
  buildGarminCoursePayload: vi.fn()
}))

vi.mock('../../../../server/utils/garmin', () => ({
  parseGarminScope: mockParseScope,
  hasGarminPermission: mockHasPermission,
  fetchGarminUserPermissions: vi.fn(),
  reconcileGarminScopes: vi.fn((s) => s),
  serializeGarminScopes: vi.fn(() => 'WORKOUT_IMPORT')
}))

vi.mock('../../../../server/utils/planned-workout-publish-guards', () => ({
  loadPlannedWorkoutPublishContext: mockLoadContext,
  appendPublishStalenessWarning: (m: string) => m,
  buildPublishWarnings: () => undefined
}))

describe('planned-workout-garmin-publish', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockParseScope.mockReturnValue(['WORKOUT_IMPORT'])
    mockHasPermission.mockReturnValue(true)
    mockSerializeGarmin.mockReturnValue({ sport: 'CYCLING', segments: [] })
    mockCreateWorkout.mockResolvedValue({ workoutId: 99 })
    mockCreateSchedule.mockResolvedValue(11)
    mockPublishRepoGet.mockResolvedValue(null)
    mockPublishRepoUpsert.mockResolvedValue({})
    mockLoadContext.mockResolvedValue({
      ok: true,
      context: {
        workout: {
          id: 'pw-1',
          title: 'Threshold',
          description: '',
          type: 'Ride',
          date: new Date('2026-09-26T00:00:00.000Z'),
          durationSec: 3600,
          distanceMeters: null,
          structuredWorkout: { steps: [{ duration: 600, power: { value: 0.9 } }] },
          user: { ftp: 250 }
        },
        sportSettings: { ftp: 250 },
        settingsStaleness: { stale: false, reasons: [] }
      }
    })
  })

  it('creates a Garmin workout + schedule when none exists', async () => {
    mockIntegrationFindFirst.mockResolvedValue({ id: 'int-1', scope: 'WORKOUT_IMPORT' })

    const result = await publishPlannedWorkoutToGarmin('user-1', 'pw-1')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.action).toBe('created')
      expect(result.target.externalId).toBe('99')
      expect(result.target.scheduleId).toBe('sched-1')
    }
    expect(mockCreateWorkout).toHaveBeenCalled()
    expect(mockCreateSchedule).toHaveBeenCalled()
  })

  it('no-ops quietly without Garmin when auto-publishing', async () => {
    mockIntegrationFindFirst.mockResolvedValue(null)
    const result = await maybeAutoPublishPlannedWorkoutToGarmin('user-1', 'pw-1')
    expect(result?.success).toBe(false)
    if (result && !result.success) expect(result.code).toBe('no_integration')
    expect(mockCreateWorkout).not.toHaveBeenCalled()
  })
})
