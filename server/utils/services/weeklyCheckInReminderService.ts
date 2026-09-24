import { toZonedTime } from 'date-fns-tz'
import { prisma } from '../db'
import { DEFAULT_TIMEZONE } from '../date'
import { getCheckInWeekStart, weekStartKey } from '../../../shared/check-in'

export type CheckInReminderCandidate = {
  userId: string
  name: string | null
  email: string | null
  timezone: string
  /** 1 = Monday, 2 = Tuesday in the athlete's local timezone. */
  localWeekday: 1 | 2
  weekStartDate: Date
  weekKey: string
}

/**
 * Athletes with an ACTIVE coaching relationship who are in the Mon–Tue fill
 * window in their own timezone and have not submitted this week's check-in.
 */
export async function findAthletesNeedingCheckInReminder(
  now: Date = new Date()
): Promise<CheckInReminderCandidate[]> {
  const relationships = await prisma.coachingRelationship.findMany({
    where: { status: 'ACTIVE' },
    select: { athleteId: true },
    distinct: ['athleteId']
  })

  const athleteIds = relationships.map((r) => r.athleteId)
  if (athleteIds.length === 0) return []

  const athletes = await prisma.user.findMany({
    where: {
      id: { in: athleteIds },
      deactivatedAt: null
    },
    select: {
      id: true,
      name: true,
      email: true,
      timezone: true
    }
  })

  const inWindow: Array<{
    user: (typeof athletes)[number]
    timezone: string
    localWeekday: 1 | 2
    weekStartDate: Date
    weekKey: string
  }> = []

  for (const user of athletes) {
    const timezone = user.timezone || DEFAULT_TIMEZONE
    let localNow: Date
    try {
      localNow = toZonedTime(now, timezone)
    } catch {
      localNow = now
    }
    const dow = localNow.getDay()
    if (dow !== 1 && dow !== 2) continue

    const weekStartDate = getCheckInWeekStart(timezone, now)
    inWindow.push({
      user,
      timezone,
      localWeekday: dow as 1 | 2,
      weekStartDate,
      weekKey: weekStartKey(weekStartDate)
    })
  }

  if (inWindow.length === 0) return []

  // Batch-load existing submissions for the weeks in play.
  const existing = await prisma.weeklyCheckIn.findMany({
    where: {
      OR: inWindow.map((row) => ({
        athleteId: row.user.id,
        weekStartDate: row.weekStartDate
      }))
    },
    select: { athleteId: true, weekStartDate: true }
  })

  const submitted = new Set(
    existing.map((row) => `${row.athleteId}:${weekStartKey(row.weekStartDate)}`)
  )

  return inWindow
    .filter((row) => !submitted.has(`${row.user.id}:${row.weekKey}`))
    .map((row) => ({
      userId: row.user.id,
      name: row.user.name,
      email: row.user.email,
      timezone: row.timezone,
      localWeekday: row.localWeekday,
      weekStartDate: row.weekStartDate,
      weekKey: row.weekKey
    }))
}

export function checkInReminderCopy(localWeekday: 1 | 2) {
  if (localWeekday === 1) {
    return {
      title: 'Weekly check-in is open',
      message:
        'It’s Monday — take a few minutes to rate your training, health, and personal week before Wednesday.',
      emailSubject: 'Your weekly check-in is open'
    }
  }
  return {
    title: 'Weekly check-in due tomorrow morning',
    message:
      'It’s Tuesday — finish your weekly check-in today so your coach can review it Wednesday.',
    emailSubject: 'Reminder: weekly check-in due before Wednesday'
  }
}
