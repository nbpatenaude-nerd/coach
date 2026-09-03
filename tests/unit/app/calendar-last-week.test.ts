import { describe, expect, it } from 'vitest'
import { isLastWeekOfMonth, getMonthName } from '~/utils/calendar'

describe('calendar utils - isLastWeekOfMonth', () => {
  it('identifies the last 7 days of a 31-day month correctly', () => {
    // January has 31 days. Last week = days 25 to 31 (inclusive).
    expect(isLastWeekOfMonth(new Date(Date.UTC(2026, 0, 24)), true)).toBe(false)
    expect(isLastWeekOfMonth(new Date(Date.UTC(2026, 0, 25)), true)).toBe(true)
    expect(isLastWeekOfMonth(new Date(Date.UTC(2026, 0, 28)), true)).toBe(true)
    expect(isLastWeekOfMonth(new Date(Date.UTC(2026, 0, 31)), true)).toBe(true)
  })

  it('identifies the last 7 days of a 30-day month correctly', () => {
    // April has 30 days. Last week = days 24 to 30 (inclusive).
    expect(isLastWeekOfMonth(new Date(Date.UTC(2026, 3, 23)), true)).toBe(false)
    expect(isLastWeekOfMonth(new Date(Date.UTC(2026, 3, 24)), true)).toBe(true)
    expect(isLastWeekOfMonth(new Date(Date.UTC(2026, 3, 30)), true)).toBe(true)
  })

  it('identifies the last 7 days of February in a non-leap year (28 days)', () => {
    // 2025 is not a leap year (28 days). Last week = days 22 to 28.
    expect(isLastWeekOfMonth(new Date(Date.UTC(2025, 1, 21)), true)).toBe(false)
    expect(isLastWeekOfMonth(new Date(Date.UTC(2025, 1, 22)), true)).toBe(true)
    expect(isLastWeekOfMonth(new Date(Date.UTC(2025, 1, 28)), true)).toBe(true)
  })

  it('identifies the last 7 days of February in a leap year (29 days)', () => {
    // 2024 is a leap year (29 days). Last week = days 23 to 29.
    expect(isLastWeekOfMonth(new Date(Date.UTC(2024, 1, 22)), true)).toBe(false)
    expect(isLastWeekOfMonth(new Date(Date.UTC(2024, 1, 23)), true)).toBe(true)
    expect(isLastWeekOfMonth(new Date(Date.UTC(2024, 1, 29)), true)).toBe(true)
  })

  it('returns correct month names', () => {
    expect(getMonthName(new Date(Date.UTC(2026, 0, 15)), true)).toBe('January')
    expect(getMonthName(new Date(Date.UTC(2026, 8, 3)), true)).toBe('September')
    expect(getMonthName(new Date(Date.UTC(2026, 11, 25)), true)).toBe('December')
  })
})
