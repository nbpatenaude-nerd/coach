import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.stubGlobal('defineEventHandler', (fn: any) => fn)
vi.stubGlobal('defineRouteMeta', () => {})
vi.stubGlobal('getRouterParam', (event: any, name: string) => event.params?.[name])
vi.stubGlobal('readBody', async (event: any) => event.body)
vi.stubGlobal('setResponseStatus', (event: any, status: number) => {
  event.statusCode = status
})
vi.stubGlobal('createError', (err: any) => {
  const error = new Error(err.message)
  ;(error as any).statusCode = err.statusCode
  ;(error as any).data = err.data
  return error
})

vi.mock('../../../../../../server/utils/auth-guard', () => ({
  requireAuth: vi.fn(async () => ({ id: 'coach-1' }))
}))

vi.mock('../../../../../../server/utils/repositories/teamRepository', () => ({
  teamRepository: {
    getGroupDetails: vi.fn(),
    checkTeamAccess: vi.fn(),
    addAthleteToGroup: vi.fn()
  }
}))

vi.mock('../../../../../../server/utils/repositories/coachingRepository', () => ({
  coachingRepository: {
    checkRelationship: vi.fn()
  }
}))

const athleteId = '11111111-1111-4111-8111-111111111111'
const groupId = '22222222-2222-4222-8222-222222222222'

describe('coaching groups members.post', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  async function loadHandler() {
    const { default: handler } =
      await import('../../../../../../server/api/coaching/groups/[id]/members.post')
    return handler
  }

  it('returns 400 when athleteId is not a UUID string', async () => {
    const handler = await loadHandler()

    await expect(
      handler({
        params: { id: groupId },
        body: { athleteId: 'not-a-uuid' }
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Invalid input'
    })
  })

  it('coerces athleteId from a select option object', async () => {
    const handler = await loadHandler()
    const { teamRepository } =
      await import('../../../../../../server/utils/repositories/teamRepository')
    const { coachingRepository } =
      await import('../../../../../../server/utils/repositories/coachingRepository')

    vi.mocked(teamRepository.getGroupDetails).mockResolvedValue({
      id: groupId,
      coachId: 'coach-1',
      teamId: null
    } as any)
    vi.mocked(coachingRepository.checkRelationship).mockResolvedValue(true as any)
    vi.mocked(teamRepository.addAthleteToGroup).mockResolvedValue({
      groupId,
      athleteId
    } as any)

    const event: any = {
      params: { id: groupId },
      body: { athleteId: { label: 'Drew', value: athleteId } }
    }
    const membership = await handler(event)

    expect(membership).toEqual({ groupId, athleteId })
    expect(teamRepository.addAthleteToGroup).toHaveBeenCalledWith(groupId, athleteId)
  })

  it('returns 400 when athleteId is missing', async () => {
    const handler = await loadHandler()

    await expect(
      handler({
        params: { id: groupId },
        body: {}
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Invalid input'
    })
  })

  it('adds a member when athleteId is a valid UUID', async () => {
    const handler = await loadHandler()
    const { teamRepository } =
      await import('../../../../../../server/utils/repositories/teamRepository')
    const { coachingRepository } =
      await import('../../../../../../server/utils/repositories/coachingRepository')

    vi.mocked(teamRepository.getGroupDetails).mockResolvedValue({
      id: groupId,
      coachId: 'coach-1',
      teamId: null
    } as any)
    vi.mocked(coachingRepository.checkRelationship).mockResolvedValue(true as any)
    vi.mocked(teamRepository.addAthleteToGroup).mockResolvedValue({
      groupId,
      athleteId
    } as any)

    const event: any = {
      params: { id: groupId },
      body: { athleteId }
    }
    const membership = await handler(event)

    expect(membership).toEqual({ groupId, athleteId })
    expect(teamRepository.addAthleteToGroup).toHaveBeenCalledWith(groupId, athleteId)
  })
})
