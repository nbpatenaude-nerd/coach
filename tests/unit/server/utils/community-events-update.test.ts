import { beforeEach, describe, expect, it, vi } from 'vitest'

import { prisma } from '../../../../server/utils/db'
import { afterPersonalEventUpdated } from '../../../../server/utils/community-events'

vi.mock('../../../../server/utils/db', () => ({
  prisma: {
    teamEvent: {
      create: vi.fn(),
      update: vi.fn()
    },
    teamEventParticipant: {
      upsert: vi.fn()
    },
    event: {
      update: vi.fn(),
      findUniqueOrThrow: vi.fn()
    }
  }
}))

describe('afterPersonalEventUpdated', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a TeamEvent when share is enabled without an existing link', async () => {
    const personal = {
      id: 'ev-1',
      title: 'T100 Vancouver',
      description: null,
      date: new Date('2027-08-11T00:00:00.000Z'),
      startTime: '07:00',
      type: 'Triathlon',
      subType: 'Triathlon (70.3)',
      distance: null,
      elevation: null,
      expectedDuration: null,
      terrain: null,
      city: 'Vancouver',
      country: 'Canada',
      location: 'Jericho Beach',
      isVirtual: false,
      websiteUrl: 'https://t100triathlon.com/vancouver',
      isPublic: true,
      teamEventId: null,
      priority: 'B',
      source: null,
      externalId: null
    }

    vi.mocked(prisma.teamEvent.create).mockResolvedValue({ id: 'team-1' } as any)
    vi.mocked(prisma.event.update).mockResolvedValue({ ...personal, teamEventId: 'team-1' } as any)
    vi.mocked(prisma.teamEventParticipant.upsert).mockResolvedValue({} as any)
    vi.mocked(prisma.event.findUniqueOrThrow).mockResolvedValue({
      ...personal,
      teamEventId: 'team-1'
    } as any)

    const result = await afterPersonalEventUpdated('user-1', personal as any, {
      shareLevel: 'FULL'
    })

    expect(prisma.teamEvent.create).toHaveBeenCalled()
    expect(result.teamEventId).toBe('team-1')
  })

  it('updates an existing TeamEvent when already linked', async () => {
    const personal = {
      id: 'ev-1',
      title: 'T100 Vancouver',
      description: 'Updated',
      date: new Date('2027-08-11T00:00:00.000Z'),
      startTime: '07:00',
      type: 'Triathlon',
      subType: null,
      distance: 100,
      elevation: null,
      expectedDuration: null,
      terrain: null,
      city: 'Vancouver',
      country: 'Canada',
      location: 'Jericho Beach',
      isVirtual: false,
      websiteUrl: null,
      isPublic: true,
      teamEventId: 'team-1',
      priority: 'B'
    }

    vi.mocked(prisma.teamEvent.update).mockResolvedValue({ id: 'team-1' } as any)
    vi.mocked(prisma.teamEventParticipant.upsert).mockResolvedValue({} as any)
    vi.mocked(prisma.event.findUniqueOrThrow).mockResolvedValue(personal as any)

    const result = await afterPersonalEventUpdated('user-1', personal as any, {
      shareLevel: 'SUMMARY',
      hideAttendeeNames: true
    })

    expect(prisma.teamEvent.create).not.toHaveBeenCalled()
    expect(prisma.teamEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'team-1' },
        data: expect.objectContaining({
          title: 'T100 Vancouver',
          shareLevel: 'SUMMARY',
          hideAttendeeNames: true
        })
      })
    )
    expect(result.teamEventId).toBe('team-1')
  })
})
