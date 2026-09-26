import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.stubGlobal('defineEventHandler', (fn: any) => fn)
vi.stubGlobal('createError', (err: any) => {
  const error = new Error(err.message || err.statusMessage)
  ;(error as any).statusCode = err.statusCode
  ;(error as any).data = err.data
  return error
})

const readBody = vi.fn()
const getRouterParam = vi.fn()
vi.stubGlobal('readBody', readBody)
vi.stubGlobal('getRouterParam', getRouterParam)

const getServerSession = vi.fn()
const update = vi.fn()
const findFirst = vi.fn()
const syncEventToIntervals = vi.fn()
const afterPersonalEventUpdated = vi.fn()

vi.mock('../../../../../server/utils/session', () => ({
  getServerSession
}))

vi.mock('../../../../../server/utils/repositories/eventRepository', () => ({
  eventRepository: {
    update
  }
}))

vi.mock('../../../../../server/utils/intervals-sync', () => ({
  syncEventToIntervals
}))

vi.mock('../../../../../server/utils/community-events', () => ({
  afterPersonalEventUpdated
}))

vi.mock('../../../../../server/utils/db', () => ({
  prisma: {
    integration: {
      findFirst
    }
  }
}))

describe('PUT /api/events/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    getServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    getRouterParam.mockReturnValue('ev-1')
    findFirst.mockResolvedValue(null)
    update.mockResolvedValue({
      id: 'ev-1',
      title: 'T100 Vancouver',
      isPublic: true,
      teamEventId: null,
      date: new Date('2027-08-11T00:00:00.000Z'),
      syncStatus: 'LOCAL_ONLY'
    })
    afterPersonalEventUpdated.mockImplementation(async (_userId: string, event: any) => ({
      event: { ...event, teamEventId: 'team-1' },
      teamEventId: 'team-1'
    }))
  })

  it('promotes shared events onto the Team Calendar on update', async () => {
    readBody.mockResolvedValue({
      title: 'T100 Vancouver',
      date: '2027-08-11T00:00:00.000Z',
      type: 'Triathlon',
      isPublic: true,
      shareLevel: 'FULL',
      hideAttendeeNames: false
    })

    const mod = await import('../../../../../server/api/events/[id].put')
    const result = await mod.default({} as any)

    expect(afterPersonalEventUpdated).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ id: 'ev-1', isPublic: true }),
      expect.objectContaining({ shareLevel: 'FULL', hideAttendeeNames: false })
    )
    expect(result).toMatchObject({
      success: true,
      community: { teamEventId: 'team-1' }
    })
  })
})
