import { beforeEach, describe, expect, it, vi } from 'vitest'

import { requireCoachAccessToAthlete } from '../../../../../../../server/utils/coaching-auth'
import { applyManualPlannedWorkoutStructureEdit } from '../../../../../../../server/utils/planned-workout-manual-structure-edit'

vi.stubGlobal('defineEventHandler', (fn: any) => fn)
vi.stubGlobal('getValidatedRouterParams', async (event: any, parser: any) =>
  parser({
    id: event.params?.id || 'athlete-1',
    workoutId: event.params?.workoutId || 'workout-1'
  })
)
vi.stubGlobal('readBody', async (event: any) => event.body)
vi.stubGlobal('createError', (err: any) => {
  const error = new Error(err.message || err.statusMessage)
  ;(error as any).statusCode = err.statusCode
  return error
})

vi.mock('../../../../../../../server/utils/auth-guard', () => ({
  requireAuth: vi.fn(async () => ({ id: 'coach-1' }))
}))

vi.mock('../../../../../../../server/utils/coaching-auth', () => ({
  requireCoachAccessToAthlete: vi.fn()
}))

vi.mock('../../../../../../../server/utils/planned-workout-manual-structure-edit', () => ({
  applyManualPlannedWorkoutStructureEdit: vi.fn()
}))

const getHandler = async () => {
  vi.resetModules()
  const mod =
    await import('../../../../../../../server/api/coaching/athletes/[id]/planned-workouts/[workoutId]/structure.patch')
  return mod.default
}

describe('PATCH /api/coaching/athletes/:id/planned-workouts/:workoutId/structure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireCoachAccessToAthlete).mockResolvedValue({} as any)
    vi.mocked(applyManualPlannedWorkoutStructureEdit).mockResolvedValue({
      success: true,
      workout: { id: 'workout-1', userId: 'athlete-1' },
      intervals_synced: false
    } as any)
  })

  it('allows a coach with write access to edit athlete structure', async () => {
    const handler = await getHandler()
    const body = {
      steps: [{ type: 'Active', durationSeconds: 300, power: { value: 0.7, units: '%' } }]
    }

    const result = await handler({
      params: { id: 'athlete-1', workoutId: 'workout-1' },
      body
    } as any)

    expect(requireCoachAccessToAthlete).toHaveBeenCalledWith(expect.anything(), 'athlete-1', [
      'coaching:write'
    ])
    expect(applyManualPlannedWorkoutStructureEdit).toHaveBeenCalledWith({
      ownerUserId: 'athlete-1',
      plannedWorkoutId: 'workout-1',
      body
    })
    expect(result.success).toBe(true)
  })

  it('rejects coaches without access to the athlete', async () => {
    vi.mocked(requireCoachAccessToAthlete).mockRejectedValue(
      Object.assign(new Error('Forbidden'), { statusCode: 403 })
    )
    const handler = await getHandler()

    await expect(
      handler({
        params: { id: 'athlete-1', workoutId: 'workout-1' },
        body: { steps: [] }
      } as any)
    ).rejects.toMatchObject({ statusCode: 403 })

    expect(applyManualPlannedWorkoutStructureEdit).not.toHaveBeenCalled()
  })
})
