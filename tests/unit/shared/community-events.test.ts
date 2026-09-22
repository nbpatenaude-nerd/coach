import { describe, expect, it } from 'vitest'
import {
  communityEventFingerprint,
  eventDayKey,
  eventsLookAlike,
  normalizeEventTitle,
  scoreCommunityMatch,
  titleSimilarity
} from '../../../shared/community-events'

describe('community event matching', () => {
  it('normalizes titles and expands IM aliases', () => {
    expect(normalizeEventTitle('Ironman Canada 70.3!')).toBe('ironman canada 70 3')
    expect(normalizeEventTitle('IM Canada')).toContain('ironman')
    expect(normalizeEventTitle('  Ironman   Canada  70.3  ')).toBe('ironman canada 70 3')
  })

  it('fuzzy-matches IM Canada to Ironman Canada', () => {
    expect(titleSimilarity('IM Canada', 'Ironman Canada')).toBeGreaterThanOrEqual(0.72)
    expect(
      eventsLookAlike(
        { title: 'IM Canada', date: new Date('2026-07-26T12:00:00.000Z') },
        { title: 'Ironman Canada', date: new Date('2026-07-26T08:00:00.000Z') }
      )
    ).toBe(true)
  })

  it('matches same-day same-title events', () => {
    const a = {
      title: 'Ironman Canada 70.3',
      date: new Date('2026-07-26T15:00:00.000Z'),
      city: 'Penticton'
    }
    const b = {
      title: 'ironman canada 70.3',
      date: new Date('2026-07-26T08:00:00.000Z'),
      city: 'Penticton'
    }
    expect(eventsLookAlike(a, b)).toBe(true)
    expect(scoreCommunityMatch(a, b)).toBeGreaterThan(0.9)
    expect(communityEventFingerprint(a).startsWith(eventDayKey(a.date))).toBe(true)
  })

  it('does not match different days', () => {
    expect(
      eventsLookAlike(
        { title: 'Local 10K', date: new Date('2026-05-01T12:00:00.000Z') },
        { title: 'Local 10K', date: new Date('2026-05-02T12:00:00.000Z') }
      )
    ).toBe(false)
  })

  it('rejects conflicting places when both are set', () => {
    expect(
      eventsLookAlike(
        {
          title: 'City Marathon',
          date: new Date('2026-04-12T12:00:00.000Z'),
          city: 'Vancouver'
        },
        {
          title: 'City Marathon',
          date: new Date('2026-04-12T12:00:00.000Z'),
          city: 'Toronto'
        }
      )
    ).toBe(false)
  })

  it('allows match when one side has no place', () => {
    expect(
      eventsLookAlike(
        {
          title: 'City Marathon',
          date: new Date('2026-04-12T12:00:00.000Z'),
          city: 'Vancouver'
        },
        { title: 'City Marathon', date: new Date('2026-04-12T12:00:00.000Z') }
      )
    ).toBe(true)
  })
})
