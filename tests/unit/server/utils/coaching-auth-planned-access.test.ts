import { beforeEach, describe, expect, it, vi } from 'vitest'

import { coachingRepository } from '../../../../server/utils/repositories/coachingRepository'
import { assertPlannedWorkoutAccess } from '../../../../server/utils/coaching-auth'

vi.mock('../../../../server/utils/db', () => ({
  prisma: {}
}))

vi.mock('../../../../server/utils/repositories/coachingRepository', () => ({
  coachingRepository: {
    checkRelationship: vi.fn()
  }
}))

vi.stubGlobal('createError', (err: any) => {
  const error = new Error(err.message)
  ;(error as any).statusCode = err.statusCode
  return error
})

describe('assertPlannedWorkoutAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows the workout owner', async () => {
    await expect(assertPlannedWorkoutAccess('athlete-1', 'athlete-1')).resolves.toBe('owner')
    expect(coachingRepository.checkRelationship).not.toHaveBeenCalled()
  })

  it('allows an active coach of the athlete', async () => {
    vi.mocked(coachingRepository.checkRelationship).mockResolvedValue(true as any)
    await expect(assertPlannedWorkoutAccess('coach-1', 'athlete-1')).resolves.toBe('coach')
    expect(coachingRepository.checkRelationship).toHaveBeenCalledWith('coach-1', 'athlete-1')
  })

  it('denies unrelated viewers', async () => {
    vi.mocked(coachingRepository.checkRelationship).mockResolvedValue(false as any)
    await expect(assertPlannedWorkoutAccess('stranger', 'athlete-1')).rejects.toMatchObject({
      statusCode: 403
    })
  })
})
