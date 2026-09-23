import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { formatPace } from '../pacing'
import { metresPerSecondToKmh } from '../../../shared/units'
import {
  SHARE_LOGO_OPTIONS,
  SHARE_METRIC_OPTIONS,
  type ShareLogoId,
  type ShareMetricId,
  normalizeShareLogoId,
  normalizeShareMetrics
} from '../../../shared/workout-share-composer'

export interface ShareWorkoutFields {
  title: string
  type: string | null
  date: Date
  durationSec: number
  distanceMeters: number | null
  elevationGain?: number | null
  averageWatts?: number | null
  maxWatts?: number | null
  normalizedPower?: number | null
  averageHr?: number | null
  maxHr?: number | null
  tss?: number | null
  kilojoules?: number | null
  averageSpeed?: number | null
  streams?: {
    latlng?: Array<[number, number] | { lat: number; lng: number } | null> | null
    heartrate?: Array<number | null | undefined> | null
    velocity?: Array<number | null | undefined> | null
  } | null
}

export interface FormattedShareMetric {
  id: ShareMetricId
  label: string
  value: string
  unit: string
}

export function resolveShareLogoFileUrl(logoId: ShareLogoId): string | null {
  const option = SHARE_LOGO_OPTIONS.find((item) => item.id === logoId)
  if (!option?.publicPath) return null
  const absolute = path.resolve(process.cwd(), `public${option.publicPath}`)
  return pathToFileURL(absolute).href
}

export function formatShareMetric(
  workout: ShareWorkoutFields,
  metricId: ShareMetricId
): FormattedShareMetric | null {
  const meta = SHARE_METRIC_OPTIONS.find((item) => item.id === metricId)
  if (!meta) return null

  switch (metricId) {
    case 'distance': {
      if (!workout.distanceMeters || workout.distanceMeters <= 0) return null
      const km = workout.distanceMeters / 1000
      return {
        id: metricId,
        label: meta.shortLabel,
        value: km >= 10 ? km.toFixed(1) : km.toFixed(2),
        unit: 'KM'
      }
    }
    case 'duration': {
      if (!workout.durationSec || workout.durationSec <= 0) return null
      return {
        id: metricId,
        label: meta.shortLabel,
        value: formatDuration(workout.durationSec),
        unit: ''
      }
    }
    case 'avgPace': {
      const pace = getAveragePaceString(workout)
      if (pace === 'N/A') return null
      return { id: metricId, label: meta.shortLabel, value: pace, unit: '/KM' }
    }
    case 'avgSpeed': {
      if (!workout.averageSpeed || workout.averageSpeed <= 0) return null
      return {
        id: metricId,
        label: meta.shortLabel,
        value: metresPerSecondToKmh(workout.averageSpeed).toFixed(1),
        unit: 'KM/H'
      }
    }
    case 'avgPower': {
      if (!workout.averageWatts) return null
      return {
        id: metricId,
        label: meta.shortLabel,
        value: String(Math.round(workout.averageWatts)),
        unit: 'W'
      }
    }
    case 'maxPower': {
      if (!workout.maxWatts) return null
      return {
        id: metricId,
        label: meta.shortLabel,
        value: String(Math.round(workout.maxWatts)),
        unit: 'W'
      }
    }
    case 'normalizedPower': {
      if (!workout.normalizedPower) return null
      return {
        id: metricId,
        label: meta.shortLabel,
        value: String(Math.round(workout.normalizedPower)),
        unit: 'W'
      }
    }
    case 'avgHr': {
      if (!workout.averageHr) return null
      return {
        id: metricId,
        label: meta.shortLabel,
        value: String(Math.round(workout.averageHr)),
        unit: 'BPM'
      }
    }
    case 'maxHr': {
      if (!workout.maxHr) return null
      return {
        id: metricId,
        label: meta.shortLabel,
        value: String(Math.round(workout.maxHr)),
        unit: 'BPM'
      }
    }
    case 'elevation': {
      if (!workout.elevationGain) return null
      return {
        id: metricId,
        label: meta.shortLabel,
        value: String(Math.round(workout.elevationGain)),
        unit: 'M'
      }
    }
    case 'tss': {
      if (workout.tss == null) return null
      return {
        id: metricId,
        label: meta.shortLabel,
        value: String(Math.round(workout.tss)),
        unit: ''
      }
    }
    case 'kj': {
      if (!workout.kilojoules) return null
      return {
        id: metricId,
        label: meta.shortLabel,
        value: String(Math.round(workout.kilojoules)),
        unit: 'KJ'
      }
    }
    default:
      return null
  }
}

export function buildShareMetricLayout(
  workout: ShareWorkoutFields,
  metricsInput?: string | string[] | null
): { hero: FormattedShareMetric | null; stats: FormattedShareMetric[] } {
  const selected = normalizeShareMetrics(metricsInput)
  const formatted = selected
    .map((id) => formatShareMetric(workout, id))
    .filter((item): item is FormattedShareMetric => !!item)

  if (formatted.length === 0) {
    return { hero: null, stats: [] }
  }

  const heroPreferred = SHARE_METRIC_OPTIONS.filter((item) => item.heroPreferred).map(
    (item) => item.id
  )
  const heroIndex = formatted.findIndex((item) => heroPreferred.includes(item.id))
  const hero = formatted[heroIndex >= 0 ? heroIndex : 0]!
  const stats = formatted.filter((item) => item.id !== hero.id).slice(0, 4)

  return { hero, stats }
}

export function buildBrandMarkSvg(options: {
  logoId?: string | null
  width: number
  height: number
  fill: string
  opacity?: number
}): string {
  const logoId = normalizeShareLogoId(options.logoId)
  if (logoId === 'none') return ''

  const opacity = options.opacity ?? 0.55
  const y = options.height - 48

  if (logoId === 'wordmark') {
    const fontSize = options.width <= 1080 && options.height === 1080 ? 18 : 24
    const letterSpacing = options.width <= 1080 && options.height === 1080 ? 3 : 4
    return `<text x="${options.width / 2}" y="${y}" text-anchor="middle" fill="${options.fill}" opacity="${opacity}" font-family="Inter" font-size="${fontSize}" font-weight="700" letter-spacing="${letterSpacing}">JOURNEY ENDURANCE</text>`
  }

  const href = resolveShareLogoFileUrl(logoId)
  if (!href) return ''

  const dims =
    logoId === 'mark'
      ? { w: 96, h: 96 }
      : logoId === 'horizontal'
        ? { w: 360, h: 72 }
        : { w: 220, h: 96 }

  const x = (options.width - dims.w) / 2
  const imageY = options.height - dims.h - 28

  return `<image href="${href}" x="${x}" y="${imageY}" width="${dims.w}" height="${dims.h}" opacity="${opacity}" preserveAspectRatio="xMidYMid meet" />`
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function getAveragePaceString(workout: ShareWorkoutFields) {
  if (workout.averageSpeed && workout.averageSpeed > 0) {
    const paceMinPerKm = 16.666667 / workout.averageSpeed
    return formatPace(paceMinPerKm).replace('/km', '')
  }

  if (workout.durationSec > 0 && workout.distanceMeters && workout.distanceMeters > 0) {
    const paceMinPerKm = workout.durationSec / 60 / (workout.distanceMeters / 1000)
    return formatPace(paceMinPerKm).replace('/km', '')
  }

  return 'N/A'
}
