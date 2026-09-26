import { beforeEach, describe, expect, it, vi } from 'vitest'

import { coachingRepository } from '../../../../server/utils/repositories/coachingRepository'
import {
  assertPlannedWorkoutAccess,
  shouldBypassAthleteQuota
} from '../../../../server/utils/coaching-auth'

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

describe('shouldBypassAthleteQuota', () => {
  it('bypasses when access role is coach', () => {
    expect(shouldBypassAthleteQuota({ accessRole: 'coach' })).toBe(true)
  })

  it('bypasses when View-as-Athlete (isCoaching)', () => {
    expect(shouldBypassAthleteQuota({ accessRole: 'owner', isCoaching: true })).toBe(true)
  })

  it('bypasses when originalUserId is set', () => {
    expect(shouldBypassAthleteQuota({ originalUserId: 'coach-1' })).toBe(true)
  })

  it('does not bypass for a normal athlete owner session', () => {
    expect(shouldBypassAthleteQuota({ accessRole: 'owner', isCoaching: false })).toBe(false)
  })
})
