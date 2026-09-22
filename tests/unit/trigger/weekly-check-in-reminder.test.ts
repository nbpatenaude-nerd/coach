import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  coachingRelationshipFindMany,
  userFindMany,
  weeklyCheckInFindMany,
  createUserNotification,
  dispatchTask,
  loggerLog,
  loggerWarn,
  loggerError
} = vi.hoisted(() => ({
  coachingRelationshipFindMany: vi.fn(),
  userFindMany: vi.fn(),
  weeklyCheckInFindMany: vi.fn(),
  createUserNotification: vi.fn(),
  dispatchTask: vi.fn(),
  loggerLog: vi.fn(),
  loggerWarn: vi.fn(),
  loggerError: vi.fn()
}))

vi.mock('../../../server/utils/db', () => ({
  prisma: {
    coachingRelationship: { findMany: coachingRelationshipFindMany },
    user: { findMany: userFindMany },
    weeklyCheckIn: { findMany: weeklyCheckInFindMany }
  }
}))

vi.mock('../../../server/utils/notifications', () => ({
  createUserNotification
}))

vi.mock('../../../server/utils/task-dispatcher', () => ({
  dispatchTask
}))

vi.mock('@trigger.dev/sdk/v3', () => ({
  logger: {
    log: loggerLog,
    warn: loggerWarn,
    error: loggerError
  },
  task: vi.fn().mockImplementation((config) => ({
    run: config.run,
    id: config.id
  }))
}))

describe('checkInReminderCopy', () => {
  it('returns Monday vs Tuesday copy', async () => {
    const { checkInReminderCopy } =
      await import('../../../server/utils/services/weeklyCheckInReminderService')
    expect(checkInReminderCopy(1).title).toMatch(/open/i)
    expect(checkInReminderCopy(2).title).toMatch(/due/i)
  })
})

describe('findAthletesNeedingCheckInReminder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns athletes in Mon window without a submission', async () => {
    // Monday 2026-09-21 16:00 UTC
    const monday = new Date('2026-09-21T16:00:00Z')

    coachingRelationshipFindMany.mockResolvedValue([{ athleteId: 'a1' }, { athleteId: 'a2' }])
    userFindMany.mockResolvedValue([
      { id: 'a1', name: 'Ada', email: 'ada@example.com', timezone: 'UTC' },
      { id: 'a2', name: 'Bob', email: 'bob@example.com', timezone: 'UTC' }
    ])
    // a2 already submitted
    weeklyCheckInFindMany.mockResolvedValue([
      { athleteId: 'a2', weekStartDate: new Date('2026-09-21T00:00:00.000Z') }
    ])

    const { findAthletesNeedingCheckInReminder } =
      await import('../../../server/utils/services/weeklyCheckInReminderService')
    const due = await findAthletesNeedingCheckInReminder(monday)
    expect(due.map((d) => d.userId)).toEqual(['a1'])
    expect(due[0]!.localWeekday).toBe(1)
    expect(due[0]!.weekKey).toBe('2026-09-21')
  })

  it('skips athletes outside Mon–Tue in their timezone', async () => {
    // Wednesday
    const wednesday = new Date('2026-09-23T16:00:00Z')
    coachingRelationshipFindMany.mockResolvedValue([{ athleteId: 'a1' }])
    userFindMany.mockResolvedValue([
      { id: 'a1', name: 'Ada', email: 'ada@example.com', timezone: 'UTC' }
    ])

    const { findAthletesNeedingCheckInReminder } =
      await import('../../../server/utils/services/weeklyCheckInReminderService')
    const due = await findAthletesNeedingCheckInReminder(wednesday)
    expect(due).toEqual([])
    expect(weeklyCheckInFindMany).not.toHaveBeenCalled()
  })
})

describe('weeklyCheckInReminderCron', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    createUserNotification.mockResolvedValue({})
    dispatchTask.mockResolvedValue({})
  })

  it('notifies and emails candidates and continues after a failure', async () => {
    coachingRelationshipFindMany.mockResolvedValue([{ athleteId: 'a1' }, { athleteId: 'a2' }])
    userFindMany.mockResolvedValue([
      { id: 'a1', name: 'Ada', email: 'ada@example.com', timezone: 'UTC' },
      { id: 'a2', name: 'Bob', email: 'bob@example.com', timezone: 'UTC' }
    ])
    weeklyCheckInFindMany.mockResolvedValue([])

    createUserNotification.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('ws down'))

    const { weeklyCheckInReminderCron } = await import('../../../trigger/weekly-check-in-reminder')

    // Force Monday
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-21T16:00:00Z'))
    try {
      const result = await weeklyCheckInReminderCron.run()
      expect(result.count).toBe(2)
      expect(result.notifiedCount).toBe(1)
      expect(result.emailedCount).toBe(2)
      expect(result.failedCount).toBe(1)
      expect(result.success).toBe(false)
      expect(dispatchTask).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          templateKey: 'WeeklyCheckInReminder',
          userId: 'a1'
        })
      )
    } finally {
      vi.useRealTimers()
    }
  })
})
