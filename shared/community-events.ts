/** Shared Team Calendar helpers (client-safe). */

export const COMMUNITY_EVENT_SOURCE = 'community'

export const TEAM_EVENT_SHARE_LEVELS = ['FULL', 'SUMMARY'] as const
export type TeamEventShareLevel = (typeof TEAM_EVENT_SHARE_LEVELS)[number]

export type CommunityEventMatchInput = {
  title: string
  date: Date
  location?: string | null
  city?: string | null
  country?: string | null
}

export type CommunityEventMatchCandidate = {
  id: string
  title: string
  date: string
  city: string | null
  location: string | null
  attendeeCount: number
  score: number
  isPinned: boolean
}

export type CommunityEventListItem = {
  id: string
  title: string
  description: string | null
  date: string
  startTime: string | null
  type: string | null
  subType: string | null
  distance: number | null
  elevation: number | null
  location: string | null
  city: string | null
  country: string | null
  isVirtual: boolean
  websiteUrl: string | null
  shareLevel: TeamEventShareLevel
  hideAttendeeNames: boolean
  isPinned: boolean
  attendeeCount: number
  attendees: Array<{ userId: string; name: string | null; image: string | null }>
  isAttending: boolean
  isOnMyCalendar: boolean
  myEventId: string | null
  createdBy: { id: string; name: string | null } | null
}

/** Common race-name aliases expanded before comparison. */
const TITLE_ALIAS_RULES: Array<[RegExp, string]> = [
  [/\bim\b/g, 'ironman'],
  [/\bim70\.?3\b/g, 'ironman 70 3'],
  [/\bhalf ironman\b/g, 'ironman 70 3'],
  [/\bim70 3\b/g, 'ironman 70 3'],
  [/\b70\.3\b/g, '70 3'],
  [/\bhm\b/g, 'half marathon'],
  [/\bfull marathon\b/g, 'marathon'],
  [/\bolympic tri\b/g, 'triathlon olympic'],
  [/\bsprint tri\b/g, 'triathlon sprint']
]

/** Collapse whitespace/punctuation; expand aliases for fuzzy compare. */
export function normalizeEventTitle(title: string): string {
  let value = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')

  for (const [pattern, replacement] of TITLE_ALIAS_RULES) {
    value = value.replace(pattern, replacement)
  }

  return value.replace(/\./g, ' ').replace(/\s+/g, ' ').trim()
}

/** UTC calendar day key YYYY-MM-DD for matching events on the same race day. */
export function eventDayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function communityEventFingerprint(input: CommunityEventMatchInput): string {
  const day = eventDayKey(input.date)
  const title = normalizeEventTitle(input.title)
  const place = normalizeEventTitle(
    [input.city, input.location, input.country].filter(Boolean).join(' ')
  )
  return `${day}|${title}|${place}`
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  const prev = new Array<number>(b.length + 1)
  const curr = new Array<number>(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min((prev[j] ?? 0) + 1, (curr[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost)
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j] ?? 0
  }
  return prev[b.length] ?? 0
}

function tokenJaccard(a: string, b: string): number {
  const aSet = new Set(a.split(' ').filter(Boolean))
  const bSet = new Set(b.split(' ').filter(Boolean))
  if (!aSet.size && !bSet.size) return 1
  if (!aSet.size || !bSet.size) return 0
  let intersection = 0
  for (const t of aSet) if (bSet.has(t)) intersection++
  const union = aSet.size + bSet.size - intersection
  return union === 0 ? 0 : intersection / union
}

/**
 * Similarity 0–1 between two titles after alias normalization.
 * Combines token overlap with edit distance so "IM Canada" ≈ "Ironman Canada".
 */
export function titleSimilarity(a: string, b: string): number {
  const na = normalizeEventTitle(a)
  const nb = normalizeEventTitle(b)
  if (!na || !nb) return 0
  if (na === nb) return 1

  // Containment: shorter fully inside longer (e.g. "ironman canada" in "ironman canada 70 3")
  if (na.includes(nb) || nb.includes(na)) {
    const shorter = Math.min(na.length, nb.length)
    const longer = Math.max(na.length, nb.length)
    return 0.85 + (0.15 * shorter) / longer
  }

  const maxLen = Math.max(na.length, nb.length)
  const editScore = maxLen === 0 ? 1 : 1 - levenshtein(na, nb) / maxLen
  const jaccard = tokenJaccard(na, nb)
  return Math.max(0, Math.min(1, editScore * 0.45 + jaccard * 0.55))
}

/** Default threshold for Team Calendar fuzzy matches. */
export const COMMUNITY_TITLE_MATCH_THRESHOLD = 0.72

export function placeConflicts(
  a: Pick<CommunityEventMatchInput, 'city' | 'location' | 'country'>,
  b: Pick<CommunityEventMatchInput, 'city' | 'location' | 'country'>
): boolean {
  const placeA = normalizeEventTitle([a.city, a.location, a.country].filter(Boolean).join(' '))
  const placeB = normalizeEventTitle([b.city, b.location, b.country].filter(Boolean).join(' '))
  return Boolean(placeA && placeB && placeA !== placeB)
}

/**
 * Score a candidate against input. Returns null when day differs or place conflicts.
 */
export function scoreCommunityMatch(
  input: CommunityEventMatchInput,
  candidate: CommunityEventMatchInput
): number | null {
  if (eventDayKey(input.date) !== eventDayKey(candidate.date)) return null
  if (placeConflicts(input, candidate)) return null
  const score = titleSimilarity(input.title, candidate.title)
  if (score < COMMUNITY_TITLE_MATCH_THRESHOLD) return null
  return score
}

/**
 * True when two events look like the same race (fuzzy title, same day, compatible place).
 */
export function eventsLookAlike(a: CommunityEventMatchInput, b: CommunityEventMatchInput): boolean {
  return scoreCommunityMatch(a, b) !== null
}
