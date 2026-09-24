import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getServerSession } from '../../../../../../server/utils/session'
import { applyManualPlannedWorkoutStructureEdit } from '../../../../../../server/utils/planned-workout-manual-structure-edit'

vi.stubGlobal('defineEventHandler', (fn: any) => fn)
vi.stubGlobal('getRouterParam', (event: any, name: string) => event.params?.[name])
vi.stubGlobal('readBody', async (event: any) => event.body)
vi.stubGlobal('createError', (err: any) => {
  const error = new Error(err.message || err.statusMessage)
  ;(error as any).statusCode = err.statusCode
  ;(error as any).statusMessage = err.statusMessage
  return error
})

vi.mock('../../../../../../server/utils/session', () => ({
  getServerSession: vi.fn()
}))

vi.mock('../../../../../../server/utils/planned-workout-manual-structure-edit', () => ({
  applyManualPlannedWorkoutStructureEdit: vi.fn()
}))

const getHandler = async () => {
  vi.resetModules()
  const mod = await import('../../../../../../server/api/workouts/planned/[id]/structure.patch')
  return mod.default
}

describe('PATCH /api/workouts/planned/:id/structure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as any)
    vi.mocked(applyManualPlannedWorkoutStructureEdit).mockResolvedValue({
      success: true,
      workout: { id: 'workout-1' },
      intervals_synced: false
    } as any)
  })

  it('delegates to applyManualPlannedWorkoutStructureEdit for the session owner', async () => {
    const handler = await getHandler()
    const body = {
      steps: [{ type: 'Active', durationSeconds: 300, power: { value: 0.7, units: '%' } }]
    }

    const result = await handler({
      params: { id: 'workout-1' },
      body
    } as any)

    expect(applyManualPlannedWorkoutStructureEdit).toHaveBeenCalledWith({
      ownerUserId: 'user-1',
      plannedWorkoutId: 'workout-1',
      body
    })
    expect(result.success).toBe(true)
  })

  it('rejects unauthenticated requests', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null as any)
    const handler = await getHandler()

    await expect(
      handler({
        params: { id: 'workout-1' },
        body: { steps: [] }
      } as any)
    ).rejects.toMatchObject({ statusCode: 401 })
  })
})
