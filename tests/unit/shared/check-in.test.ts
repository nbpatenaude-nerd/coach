import { describe, it, expect } from 'vitest'
import {
  DEFAULT_CHECK_IN_FORM,
  checkInFields,
  checkInNumericFields,
  checkInFieldColor,
  checkInNormalizedScore,
  checkInSectionForField,
  getCheckInWeekStart,
  weekStartKey,
  validateCheckInResponses
} from '../../../shared/check-in'

describe('shared/check-in form contract', () => {
  it('has 9 rating fields and 6 text fields', () => {
    const fields = checkInFields(DEFAULT_CHECK_IN_FORM)
    const ratings = fields.filter((f) => f.type === 'rating')
    const text = fields.filter((f) => f.type === 'paragraph' || f.type === 'text')
    expect(ratings).toHaveLength(9)
    expect(text).toHaveLength(6)
  })

  it('places personal_fatigue under Health', () => {
    const section = checkInSectionForField(DEFAULT_CHECK_IN_FORM, 'personal_fatigue')
    expect(section?.key).toBe('health')
  })

  it('includes wellness_pain_score slider', () => {
    const ids = checkInFields(DEFAULT_CHECK_IN_FORM).map((f) => f.id)
    expect(ids).toContain('wellness_pain_score')
  })

  it('normalizes lower_is_better fatigue correctly', () => {
    const fatigue = checkInFields(DEFAULT_CHECK_IN_FORM).find((f) => f.id === 'personal_fatigue')!
    expect(checkInNormalizedScore(fatigue, 1)).toBeCloseTo(1)
    expect(checkInNormalizedScore(fatigue, 10)).toBeCloseTo(0)
  })

  it('colours fatigue with the health palette', () => {
    const color = checkInFieldColor(DEFAULT_CHECK_IN_FORM, 'personal_fatigue')
    expect(color.startsWith('#')).toBe(true)
  })

  it('exposes numeric fields for charting', () => {
    expect(checkInNumericFields(DEFAULT_CHECK_IN_FORM).length).toBe(9)
  })
})

describe('weekly check-in week boundaries', () => {
  it('returns Monday for a Wednesday in America/Vancouver', () => {
    // 2026-09-23 18:00 UTC = Wednesday afternoon Vancouver (PDT)
    const wed = new Date('2026-09-23T18:00:00Z')
    const weekStart = getCheckInWeekStart('America/Vancouver', wed)
    expect(weekStartKey(weekStart)).toBe('2026-09-21')
  })

  it('rolls to previous Monday on Sunday evening Vancouver', () => {
    // 2026-09-21 06:00 UTC = Sunday 23:00 Vancouver (UTC-7)
    const sun = new Date('2026-09-21T06:00:00Z')
    const weekStart = getCheckInWeekStart('America/Vancouver', sun)
    expect(weekStartKey(weekStart)).toBe('2026-09-14')
  })
})

describe('validateCheckInResponses', () => {
  it('accepts a complete rating set', () => {
    const raw: Record<string, unknown> = {}
    for (const field of checkInNumericFields(DEFAULT_CHECK_IN_FORM)) {
      raw[field.id] = 5
    }
    const result = validateCheckInResponses(DEFAULT_CHECK_IN_FORM, raw)
    expect(result.ok).toBe(true)
    if (result.ok) expect(Object.keys(result.responses).length).toBe(9)
  })

  it('rejects missing required ratings', () => {
    const result = validateCheckInResponses(DEFAULT_CHECK_IN_FORM, {})
    expect(result.ok).toBe(false)
  })
})
