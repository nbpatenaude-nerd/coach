/**
 * Shared config for the workout social-share composer (UI + image API).
 */

export const SHARE_METRIC_IDS = [
  'distance',
  'duration',
  'avgPace',
  'avgSpeed',
  'avgPower',
  'maxPower',
  'normalizedPower',
  'avgHr',
  'maxHr',
  'elevation',
  'tss',
  'kj'
] as const

export type ShareMetricId = (typeof SHARE_METRIC_IDS)[number]

export const SHARE_LOGO_IDS = ['wordmark', 'mark', 'lockup', 'horizontal', 'none'] as const

export type ShareLogoId = (typeof SHARE_LOGO_IDS)[number]

export interface ShareLogoOption {
  id: ShareLogoId
  label: string
  description: string
  /** Public path under /public, or null for text-only / hidden. */
  publicPath: string | null
}

export interface ShareMetricOption {
  id: ShareMetricId
  label: string
  shortLabel: string
  /** Prefer as the large hero number when selected. */
  heroPreferred?: boolean
}

export const SHARE_LOGO_OPTIONS: ShareLogoOption[] = [
  {
    id: 'wordmark',
    label: 'Wordmark',
    description: 'Journey Endurance text',
    publicPath: null
  },
  {
    id: 'mark',
    label: 'Mark',
    description: 'Icon only',
    // PNG only — @resvg/resvg-js does not decode WebP images in <image>.
    publicPath: '/media/logo_square.png'
  },
  {
    id: 'lockup',
    label: 'Lockup',
    description: 'Logo + text (stacked)',
    publicPath: '/media/logo_with_text_cropped.png'
  },
  {
    id: 'horizontal',
    label: 'Horizontal',
    description: 'Logo + text (wide)',
    publicPath: '/media/logo_with_text_horizontal.png'
  },
  {
    id: 'none',
    label: 'None',
    description: 'No brand mark',
    publicPath: null
  }
]

export const SHARE_METRIC_OPTIONS: ShareMetricOption[] = [
  { id: 'distance', label: 'Distance', shortLabel: 'Distance', heroPreferred: true },
  { id: 'duration', label: 'Duration', shortLabel: 'Time', heroPreferred: true },
  { id: 'avgPace', label: 'Avg Pace', shortLabel: 'Avg Pace' },
  { id: 'avgSpeed', label: 'Avg Speed', shortLabel: 'Avg Speed' },
  { id: 'avgPower', label: 'Avg Power', shortLabel: 'Avg Power' },
  { id: 'maxPower', label: 'Max Power', shortLabel: 'Max Power' },
  { id: 'normalizedPower', label: 'Normalized Power', shortLabel: 'NP' },
  { id: 'avgHr', label: 'Avg Heart Rate', shortLabel: 'Avg HR' },
  { id: 'maxHr', label: 'Max Heart Rate', shortLabel: 'Max HR' },
  { id: 'elevation', label: 'Elevation Gain', shortLabel: 'Elev' },
  { id: 'tss', label: 'Training Stress', shortLabel: 'TSS' },
  { id: 'kj', label: 'Work (kJ)', shortLabel: 'kJ' }
]

/** Default selection when the athlete opens the composer. */
export const DEFAULT_SHARE_METRICS: ShareMetricId[] = [
  'distance',
  'duration',
  'avgPace',
  'avgHr',
  'avgPower'
]

export const DEFAULT_SHARE_LOGO: ShareLogoId = 'wordmark'

/** Max metrics rendered on the card (1 hero + up to 4 secondary). */
export const MAX_SHARE_METRICS = 5

export function normalizeShareLogoId(value?: string | null): ShareLogoId {
  if (value && (SHARE_LOGO_IDS as readonly string[]).includes(value)) {
    return value as ShareLogoId
  }
  return DEFAULT_SHARE_LOGO
}

export function normalizeShareMetrics(
  value?: string | string[] | null,
  fallback: ShareMetricId[] = DEFAULT_SHARE_METRICS
): ShareMetricId[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean)
      : []

  const seen = new Set<ShareMetricId>()
  const selected: ShareMetricId[] = []

  for (const id of raw) {
    if (!(SHARE_METRIC_IDS as readonly string[]).includes(id)) continue
    const metricId = id as ShareMetricId
    if (seen.has(metricId)) continue
    seen.add(metricId)
    selected.push(metricId)
    if (selected.length >= MAX_SHARE_METRICS) break
  }

  return selected.length > 0 ? selected : [...fallback]
}

export function sportDefaultMetrics(type?: string | null): ShareMetricId[] {
  const normalized = (type || '').toLowerCase()
  if (/(run|walk|hike|trail)/.test(normalized)) {
    return ['distance', 'duration', 'avgPace', 'avgHr', 'elevation']
  }
  if (/(ride|bike|cycling|virtual)/.test(normalized)) {
    return ['distance', 'duration', 'avgPower', 'maxPower', 'avgHr']
  }
  if (/(swim)/.test(normalized)) {
    return ['distance', 'duration', 'avgPace', 'avgHr', 'avgSpeed']
  }
  return [...DEFAULT_SHARE_METRICS]
}
