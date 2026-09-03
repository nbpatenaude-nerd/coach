import { format, toZonedTime } from 'date-fns-tz'
import type { CalendarActivity } from '~/types/calendar'

export interface CalendarResponse {
  activities?: CalendarActivity[]
  nutritionByDate?: Record<string, unknown>
  wellnessByDate?: Record<string, unknown>
}

function formatUtcDateKey(date: string | Date): string {
  return format(toZonedTime(new Date(date), 'UTC'), 'yyyy-MM-dd', { timeZone: 'UTC' })
}

function formatLocalDateKey(date: string | Date, timezone: string): string {
  return format(toZonedTime(new Date(date), timezone), 'yyyy-MM-dd')
}

export function getCalendarActivityDateKey(
  activity: Pick<CalendarActivity, 'source' | 'date'>,
  timezone: string
): string {
  if (activity.source === 'completed') {
    return formatLocalDateKey(activity.date, timezone)
  }

  return formatUtcDateKey(activity.date)
}

export function getCalendarActivities(
  response: CalendarActivity[] | CalendarResponse | null | undefined
): CalendarActivity[] {
  if (Array.isArray(response)) {
    return response
  }

  if (Array.isArray(response?.activities)) {
    return response.activities
  }

  return []
}

/**
 * Check if a given date falls within the last week of its month.
 * Defined as the last 7 calendar days of the month (e.g. days 25-31 in a 31-day month, days 24-30 in a 30-day month).
 */
export function isLastWeekOfMonth(date: Date = new Date(), useUtc = true): boolean {
  const year = useUtc ? date.getUTCFullYear() : date.getFullYear()
  const month = useUtc ? date.getUTCMonth() : date.getMonth()
  const day = useUtc ? date.getUTCDate() : date.getDate()
  const totalDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return day >= totalDays - 6 && day <= totalDays
}

/**
 * Get the full English month name for a given date.
 */
export function getMonthName(date: Date = new Date(), useUtc = true): string {
  const month = useUtc ? date.getUTCMonth() : date.getMonth()
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
  return monthNames[month] || ''
}
