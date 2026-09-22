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
  validateCheckInResponses,
  isAllowedCoachVideoUrl,
  coachVideoEmbedUrl,
  buildCheckInTimeline,
  aggregateCheckInFieldStats,
  formatCheckInResponsesForPrompt,
  listCheckInOutliers
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

describe('coach video URL helpers', () => {
  it('allows Komodo and Trinerds hosts', () => {
    expect(isAllowedCoachVideoUrl('https://komodo.ai/embed/abc')).toBe(true)
    expect(isAllowedCoachVideoUrl('https://app.komodo.ai/recordings/abc')).toBe(true)
    expect(isAllowedCoachVideoUrl('https://video.trinerds.com/v/abc')).toBe(true)
  })

  it('rejects empty-optional and foreign hosts', () => {
    expect(isAllowedCoachVideoUrl('')).toBe(true)
    expect(isAllowedCoachVideoUrl(null)).toBe(true)
    expect(isAllowedCoachVideoUrl('https://youtube.com/watch?v=1')).toBe(false)
    expect(isAllowedCoachVideoUrl('not-a-url')).toBe(false)
  })

  it('rewrites Komodo recordings to embed paths', () => {
    expect(coachVideoEmbedUrl('https://komodo.ai/recordings/abc')).toBe(
      'https://komodo.ai/embed/abc'
    )
    expect(coachVideoEmbedUrl('https://komodo.ai/embed/abc')).toBe('https://komodo.ai/embed/abc')
  })
})

describe('check-in trend aggregation', () => {
  const rows = [
    {
      weekStartDate: '2026-09-07',
      submittedAt: '2026-09-08T12:00:00Z',
      responses: { training_load: 4, personal_fatigue: 6 } as Record<string, number>
    },
    {
      weekStartDate: '2026-09-14',
      submittedAt: '2026-09-15T12:00:00Z',
      responses: { training_load: 6, personal_fatigue: 4 } as Record<string, number>
    },
    {
      weekStartDate: '2026-09-21',
      submittedAt: '2026-09-22T12:00:00Z',
      responses: { training_load: 8, personal_fatigue: 3 } as Record<string, number>
    }
  ]

  it('builds chronological timeline points', () => {
    const timeline = buildCheckInTimeline(rows, DEFAULT_CHECK_IN_FORM)
    expect(timeline).toHaveLength(3)
    expect(timeline[0]!.weekStartDate).toBe('2026-09-07')
    expect(timeline[2]!.training_load).toBe(8)
    expect(timeline[1]!.personal_fatigue).toBe(4)
  })

  it('averages field stats across submissions', () => {
    const stats = aggregateCheckInFieldStats(rows, DEFAULT_CHECK_IN_FORM)
    const load = stats.find((s) => s.fieldId === 'training_load')!
    expect(load.avg).toBeCloseTo(6)
    expect(load.min).toBe(4)
    expect(load.max).toBe(8)
    expect(load.sampleCount).toBe(3)
  })
})

describe('check-in draft prompt formatting', () => {
  it('formats sections with ratings and blanks', () => {
    const text = formatCheckInResponsesForPrompt(DEFAULT_CHECK_IN_FORM, {
      training_load: 9,
      personal_notes: 'Busy travel week'
    })
    expect(text).toContain('### Training')
    expect(text).toContain('Training Load: 9/10')
    expect(text).toContain('Personal Notes: Busy travel week')
    expect(text).toContain('Sleep Quality: (blank)')
  })

  it('flags low higher_is_better and high lower_is_better ratings', () => {
    const flags = listCheckInOutliers(DEFAULT_CHECK_IN_FORM, {
      training_hydration: 2,
      personal_fatigue: 9,
      training_load: 5
    })
    expect(flags.some((f) => /Hydration is low/i.test(f))).toBe(true)
    expect(flags.some((f) => /Fatigue is elevated/i.test(f))).toBe(true)
    expect(flags.some((f) => /Load/i.test(f))).toBe(false)
  })
})
