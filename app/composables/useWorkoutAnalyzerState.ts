import { decode } from '@googlemaps/polyline-codec'
import { createWorkoutAnalysisApi, type WorkoutAnalysisScope } from '~/utils/workoutAnalysisApi'

export type AnalyzerMode = 'classic' | 'analyze360'
export type AnalyzerLayoutMode = 'default' | 'chart-focus'

export type StreamOption = { label: string; value: string }

const STREAM_META: Record<string, { label: string; color: string; unit: string }> = {
  heartrate: { label: 'Heart Rate', color: '#ef4444', unit: ' bpm' },
  altitude: { label: 'Altitude', color: '#10b981', unit: 'm' },
  velocity: { label: 'Speed/Pace', color: '#3b82f6', unit: '' },
  watts: { label: 'Power', color: '#8b5cf6', unit: 'W' },
  cadence: { label: 'Cadence', color: '#f59e0b', unit: ' rpm' },
  grade: { label: 'Grade', color: '#6b7280', unit: '%' },
  distance: { label: 'Distance', color: '#4b5563', unit: 'm' },
  moving: { label: 'Moving', color: '#94a3b8', unit: '' },
  torque: { label: 'Torque', color: '#f97316', unit: ' N-m' },
  temp: { label: 'Temperature', color: '#06b6d4', unit: '°C' },
  respiration: { label: 'Respiration', color: '#ec4899', unit: ' brpm' },
  hrv: { label: 'HRV', color: '#84cc16', unit: ' ms' },
  leftRightBalance: { label: 'L/R Balance', color: '#d946ef', unit: '%' },
  targetPower: { label: 'Target Power', color: '#10b981', unit: 'W' },
  target_power: { label: 'Target Power', color: '#10b981', unit: 'W' }
}

/** Preferred display order for Timeline-style channel pills */
const STREAM_ORDER = [
  'heartrate',
  'altitude',
  'velocity',
  'watts',
  'cadence',
  'grade',
  'distance',
  'moving',
  'torque',
  'temp',
  'respiration',
  'hrv',
  'leftRightBalance',
  'targetPower',
  'target_power'
]

const STREAM_BLACKLIST = new Set([
  'time',
  'latlng',
  'hrZones',
  'powerZones',
  'hrZoneTimes',
  'powerZoneTimes',
  'pacingStrategy',
  'lapSplits',
  'surges',
  'detectedIntervals',
  'detectedClimbs',
  'icu_intervals',
  'icu_groups',
  'id',
  'workoutId',
  'createdAt',
  'updatedAt'
])

export function getStreamMetadata(key: string) {
  if (STREAM_META[key]) return STREAM_META[key]
  // Humanize unknown/calculated stream keys (e.g. verticalOscillation → Vertical Oscillation)
  const label = key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  return { label, color: '#9ca3af', unit: '' }
}

function isPlottableStream(data: unknown): boolean {
  if (!Array.isArray(data) || data.length === 0) return false
  // Accept numeric streams and boolean moving flags
  const sample = data.find((v) => v != null)
  return typeof sample === 'number' || typeof sample === 'boolean'
}

/** Normalize alias keys so charts always read a single canonical key. */
function normalizeStreams(streams: Record<string, any> | null | undefined) {
  if (!streams || typeof streams !== 'object') return streams
  const next = { ...streams }
  if (
    (!next.targetPower || !Array.isArray(next.targetPower) || next.targetPower.length === 0) &&
    Array.isArray(next.target_power) &&
    next.target_power.length > 0
  ) {
    next.targetPower = next.target_power
  }
  if (
    (!next.leftRightBalance ||
      !Array.isArray(next.leftRightBalance) ||
      next.leftRightBalance.length === 0) &&
    Array.isArray(next.left_right_balance) &&
    next.left_right_balance.length > 0
  ) {
    next.leftRightBalance = next.left_right_balance
  }
  return next
}

export function useWorkoutAnalyzerState(options: {
  workoutId: string
  scope: WorkoutAnalysisScope
}) {
  const api = createWorkoutAnalysisApi(options.workoutId, options.scope)
  const userStore = useUserStore()

  const loading = ref(true)
  const error = ref<string | null>(null)
  const workout = ref<any>(null)
  const lapSplits = ref<any[]>([])
  const detectedIntervals = ref<any[]>([])
  const detectedClimbs = ref<any[]>([])
  const peakPowerWindows = ref<any[]>([])
  const hrZones = ref<any[]>([])
  const segmentTab = ref('laps')
  const hoverIndex = ref<number | null>(null)
  const hoverSplit = ref<any | null>(null)
  const zoomRange = ref<[number, number] | null>(null)
  const selectedSegmentRange = ref<[number, number] | null>(null)
  const selectedSegmentSource = ref<
    | { type: 'peak'; duration: number; label: string }
    | { type: 'lap'; lap: number; label: string }
    | { type: 'custom'; label: string }
    | null
  >(null)
  const selectedSegmentSummary = ref<any | null>(null)
  const selectedSegmentLoading = ref(false)
  const selectedSegmentError = ref<string | null>(null)
  const selectedStreamObjects = ref<StreamOption[]>([])
  const selectedStreamValues = ref<string[]>([])
  const analyzerMode = ref<AnalyzerMode>('classic')
  const layoutMode = ref<AnalyzerLayoutMode>(
    (userStore.user?.dashboardSettings?.mapLayoutMode as AnalyzerLayoutMode) || 'default'
  )
  const activeLibraryPanels = ref<string[]>(loadLibraryPanels())
  const peakPowerLoading = ref(false)

  const summaryPolylineCoordinates = computed<[number, number][]>(() => {
    const polyline = workout.value?.summaryPolyline
    if (!polyline) return []
    try {
      return decode(polyline) as [number, number][]
    } catch {
      return []
    }
  })

  const availableStreamOptions = computed(() => {
    if (!workout.value?.streams) return []
    const streams = toRaw(workout.value.streams)
    const availableKeys = new Set(Object.keys(streams))
    selectedStreamValues.value.forEach((key) => availableKeys.add(key))

    // Prefer targetPower over target_power when both exist
    if (availableKeys.has('targetPower') && availableKeys.has('target_power')) {
      availableKeys.delete('target_power')
    }
    if (availableKeys.has('leftRightBalance') && availableKeys.has('left_right_balance')) {
      availableKeys.delete('left_right_balance')
    }

    const options = Array.from(availableKeys)
      .filter((key) => {
        if (STREAM_BLACKLIST.has(key)) return false
        const data = streams[key]
        const isArray = Array.isArray(data) && data.length > 0
        const isSelected = selectedStreamValues.value.includes(key)
        // Known Timeline channels or any other numeric array stream (calculated channels)
        return (isArray && (STREAM_META[key] || isPlottableStream(data))) || isSelected
      })
      .map((key) => ({
        label: getStreamMetadata(key).label,
        value: key
      }))

    return options.sort((a, b) => {
      const ai = STREAM_ORDER.indexOf(a.value)
      const bi = STREAM_ORDER.indexOf(b.value)
      const aRank = ai === -1 ? STREAM_ORDER.length : ai
      const bRank = bi === -1 ? STREAM_ORDER.length : bi
      if (aRank !== bRank) return aRank - bRank
      return a.label.localeCompare(b.label)
    })
  })

  const zoomedStreams = computed(() => {
    if (!workout.value?.streams) return null
    if (!zoomRange.value) return workout.value.streams
    const [start, end] = zoomRange.value
    const filtered: Record<string, any> = {}
    Object.keys(workout.value.streams).forEach((key) => {
      const data = workout.value.streams[key]
      filtered[key] = Array.isArray(data) ? data.slice(start, end + 1) : data
    })
    return filtered
  })

  const activeHighlightRange = computed(() => hoverSplitRange.value || selectedSegmentRange.value)

  const hoverSplitRange = computed(() => {
    if (!hoverSplit.value || !workout.value?.streams?.time) return null
    if (segmentTab.value === 'laps') {
      const splits = lapSplits.value
      const currentIdx = splits.findIndex((s) => s.lap === hoverSplit.value!.lap)
      if (currentIdx === -1) return null
      let startTime = 0
      for (let i = 0; i < currentIdx; i++) startTime += splits[i].time
      const endTime = startTime + hoverSplit.value.time
      return indexRangeFromTimes(startTime, endTime)
    }
    if (hoverSplit.value.start_index !== undefined && hoverSplit.value.end_index !== undefined) {
      return [hoverSplit.value.start_index, hoverSplit.value.end_index] as [number, number]
    }
    return null
  })

  const zoomedHoverIndex = computed(() => {
    if (hoverIndex.value === null || hoverIndex.value === undefined) return null
    if (!zoomRange.value) return hoverIndex.value
    const [zoomStart, zoomEnd] = zoomRange.value
    if (hoverIndex.value < zoomStart || hoverIndex.value > zoomEnd) return null
    return hoverIndex.value - zoomStart
  })

  const zoomedActiveHighlightRange = computed(() => {
    if (!activeHighlightRange.value) return null
    if (!zoomRange.value || !zoomedStreams.value?.time?.length) return activeHighlightRange.value
    const [zoomStart, zoomEnd] = zoomRange.value
    const [rangeStart, rangeEnd] = activeHighlightRange.value
    const clippedStart = Math.max(rangeStart, zoomStart)
    const clippedEnd = Math.min(rangeEnd, zoomEnd)
    if (clippedStart > clippedEnd) return null
    return [clippedStart - zoomStart, clippedEnd - zoomStart] as [number, number]
  })

  const selectedSegmentLabel = computed(() => {
    const summary = selectedSegmentSummary.value
    const sourceLabel = selectedSegmentSource.value?.label || 'Custom selection'
    if (!summary) return sourceLabel
    return `${sourceLabel} | ${formatTime(summary.startTime || 0)}-${formatTime(summary.endTime || 0)}`
  })

  const selectedSegmentMetricItems = computed(() => {
    const summary = selectedSegmentSummary.value
    if (!summary) {
      return [
        { label: 'Duration', value: '-' },
        { label: 'Distance', value: '-' },
        { label: 'NP', value: '-' },
        { label: 'Avg Power', value: '-' },
        { label: 'Avg HR', value: '-' },
        { label: 'Elev Gain', value: '-' }
      ]
    }
    return [
      { label: 'Duration', value: formatTime(summary.durationSec || 0) },
      {
        label: 'Distance',
        value:
          typeof summary.distanceMeters === 'number'
            ? `${(summary.distanceMeters / 1000).toFixed(2)} km`
            : '-'
      },
      {
        label: 'NP',
        value:
          typeof summary.normalizedPower === 'number'
            ? `${Math.round(summary.normalizedPower)}W`
            : '-'
      },
      {
        label: 'Avg Power',
        value:
          typeof summary.averageWatts === 'number' ? `${Math.round(summary.averageWatts)}W` : '-'
      },
      {
        label: 'Avg HR',
        value: typeof summary.averageHr === 'number' ? `${Math.round(summary.averageHr)} bpm` : '-'
      },
      {
        label: 'Elev Gain',
        value:
          typeof summary.elevationGain === 'number' ? `${Math.round(summary.elevationGain)} m` : '-'
      }
    ]
  })

  const entireWorkoutMetricItems = computed(() => {
    const w = workout.value
    if (!w) return []
    return [
      { label: 'Duration', value: formatTime(w.durationSec || 0) },
      {
        label: 'Distance',
        value: w.distanceMeters != null ? `${(w.distanceMeters / 1000).toFixed(2)} km` : '-'
      },
      { label: 'TSS', value: w.tss != null ? String(Math.round(w.tss)) : '-' },
      {
        label: 'Avg HR',
        value: w.averageHr != null ? `${Math.round(w.averageHr)} bpm` : '-'
      },
      {
        label: 'NP',
        value: w.normalizedPower != null ? `${Math.round(w.normalizedPower)}W` : '-'
      },
      {
        label: 'Elev Gain',
        value: w.elevationGain != null ? `${Math.round(w.elevationGain)} m` : '-'
      }
    ]
  })

  watch(
    selectedStreamObjects,
    (newObjs) => {
      const newValues = newObjs.map((o) => o.value)
      if (
        JSON.stringify(newValues.slice().sort()) !==
        JSON.stringify(selectedStreamValues.value.slice().sort())
      ) {
        selectedStreamValues.value = newValues
      }
      if (newValues.length > 0 && options.scope.kind === 'athlete') {
        userStore.updateDashboardSettings({ mapSelectedStreams: newValues })
      }
    },
    { deep: true }
  )

  watch(
    selectedStreamValues,
    (newValues) => {
      if (newValues.length !== selectedStreamObjects.value.length) {
        const currentMap = new Map(selectedStreamObjects.value.map((o) => [o.value, o]))
        const newObjs = newValues
          .map((v) => currentMap.get(v) || availableStreamOptions.value.find((o) => o.value === v))
          .filter(Boolean) as StreamOption[]
        const currentKeys = selectedStreamObjects.value.map((o) => o.value)
        const newKeys = newObjs.map((o) => o.value)
        if (JSON.stringify(currentKeys) !== JSON.stringify(newKeys)) {
          selectedStreamObjects.value = newObjs
        }
      }
    },
    { deep: true }
  )

  watch(layoutMode, (newMode) => {
    if (options.scope.kind === 'athlete') {
      userStore.updateDashboardSettings({ mapLayoutMode: newMode })
    }
  })

  watch(
    activeLibraryPanels,
    (panels) => {
      try {
        localStorage.setItem(`workout-analyzer-panels:${options.workoutId}`, JSON.stringify(panels))
      } catch {
        /* ignore */
      }
    },
    { deep: true }
  )

  function loadLibraryPanels(): string[] {
    try {
      const raw = localStorage.getItem(`workout-analyzer-panels:${options.workoutId}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {
      /* ignore */
    }
    return ['time-in-zones', 'peak-curve']
  }

  function indexRangeFromTimes(startTime: number, endTime: number): [number, number] | null {
    const timeStream = workout.value?.streams?.time
    if (!Array.isArray(timeStream) || !timeStream.length) return null
    let startIdx = timeStream.findIndex((t: number) => t >= startTime)
    if (startIdx === -1) startIdx = 0
    let endIdx = timeStream.findIndex((t: number) => t >= endTime)
    if (endIdx === -1) endIdx = timeStream.length - 1
    return [startIdx, endIdx]
  }

  function findDisplayIndexAtOrAfter(targetTime: number) {
    const timeStream = workout.value?.streams?.time || []
    const index = timeStream.findIndex((time: number) => time >= targetTime)
    return index === -1 ? Math.max(0, timeStream.length - 1) : index
  }

  function findDisplayIndexAtOrBefore(targetTime: number) {
    const timeStream = workout.value?.streams?.time || []
    for (let index = timeStream.length - 1; index >= 0; index--) {
      if (timeStream[index] <= targetTime) return index
    }
    return 0
  }

  async function loadSelectedSegmentSummary(startTime: number, endTime: number) {
    selectedSegmentLoading.value = true
    selectedSegmentError.value = null
    try {
      selectedSegmentSummary.value = await $fetch(api.segmentSummary(), {
        method: 'POST',
        body: { startTime, endTime }
      })
    } catch (e: any) {
      selectedSegmentSummary.value = null
      selectedSegmentError.value = e?.data?.message || e?.message || 'Segment metrics unavailable'
    } finally {
      selectedSegmentLoading.value = false
    }
  }

  function selectTimeRange(startTime: number, endTime: number) {
    const startIndex = findDisplayIndexAtOrAfter(Math.min(startTime, endTime))
    const endIndex = findDisplayIndexAtOrBefore(Math.max(startTime, endTime))
    selectedSegmentRange.value = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)]
    void loadSelectedSegmentSummary(Math.min(startTime, endTime), Math.max(startTime, endTime))
  }

  function selectLap(split: any) {
    const splits = lapSplits.value
    const currentIdx = splits.findIndex((s) => s.lap === split.lap)
    if (currentIdx === -1) return
    let startTime = 0
    for (let i = 0; i < currentIdx; i++) startTime += Number(splits[i].time || 0)
    const endTime = startTime + Number(split.time || 0)
    selectedSegmentSource.value = {
      type: 'lap',
      lap: split.lap,
      label: `Lap #${split.lap}`
    }
    selectTimeRange(startTime, endTime)
  }

  function selectPeakWindow(peak: any) {
    selectedSegmentSource.value = {
      type: 'peak',
      duration: peak.duration,
      label: `${peak.durationLabel || peak.duration + 's'} peak`
    }
    selectTimeRange(peak.startTime, peak.endTime)
  }

  function onChartHover(index: number) {
    hoverIndex.value = zoomRange.value ? zoomRange.value[0] + index : index
  }

  function onChartLeave() {
    hoverIndex.value = null
  }

  function onChartZoom(range: [number, number]) {
    const [start, end] = range
    if (zoomRange.value) {
      zoomRange.value = [zoomRange.value[0] + start, zoomRange.value[0] + end]
    } else {
      zoomRange.value = [start, end]
    }
  }

  function resetZoom() {
    zoomRange.value = null
  }

  function onChartSelect(range: [number, number]) {
    const [relativeStart, relativeEnd] = range
    const startIndex = zoomRange.value ? zoomRange.value[0] + relativeStart : relativeStart
    const endIndex = zoomRange.value ? zoomRange.value[0] + relativeEnd : relativeEnd
    const timeStream = workout.value?.streams?.time || []
    const startTime = timeStream[Math.min(startIndex, endIndex)]
    const endTime = timeStream[Math.max(startIndex, endIndex)]
    if (typeof startTime !== 'number' || typeof endTime !== 'number') return
    selectedSegmentSource.value = { type: 'custom', label: 'Custom selection' }
    selectedSegmentRange.value = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)]
    void loadSelectedSegmentSummary(startTime, endTime)
  }

  function clearSelectedSegment() {
    selectedSegmentRange.value = null
    selectedSegmentSource.value = null
    selectedSegmentSummary.value = null
    selectedSegmentError.value = null
  }

  function onSplitHover(split: any) {
    hoverSplit.value = split
  }

  function onSplitLeave() {
    hoverSplit.value = null
  }

  function addLibraryPanel(id: string) {
    if (!activeLibraryPanels.value.includes(id)) {
      activeLibraryPanels.value = [...activeLibraryPanels.value, id]
    }
  }

  function removeLibraryPanel(id: string) {
    activeLibraryPanels.value = activeLibraryPanels.value.filter((p) => p !== id)
  }

  async function fetchPeakPowerWindows() {
    if (peakPowerLoading.value || peakPowerWindows.value.length > 0) return
    const streams = workout.value?.streams
    if (!Array.isArray(streams?.watts) || !streams.watts.length) return
    try {
      peakPowerLoading.value = true
      const data = await $fetch<any>(api.powerCurve())
      peakPowerWindows.value = Array.isArray(data?.powerCurve) ? data.powerCurve : []
    } catch {
      peakPowerWindows.value = []
    } finally {
      peakPowerLoading.value = false
    }
  }

  async function load() {
    loading.value = true
    error.value = null
    try {
      const workoutReq = api.workout()
      const [workoutData, streamsDataRaw] = await Promise.all([
        $fetch<any>(workoutReq.url, { query: workoutReq.query as any }),
        $fetch<any>(api.streams())
      ])
      const streamsData = normalizeStreams(streamsDataRaw)

      workout.value = { ...workoutData, streams: streamsData }
      lapSplits.value = Array.isArray(streamsData?.lapSplits) ? streamsData.lapSplits : []
      detectedIntervals.value = Array.isArray(streamsData?.detectedIntervals)
        ? streamsData.detectedIntervals
        : []
      detectedClimbs.value = Array.isArray(streamsData?.detectedClimbs)
        ? streamsData.detectedClimbs
        : []

      if (streamsData?.hrZoneTimes && streamsData?.hrZones) {
        hrZones.value = streamsData.hrZoneTimes
          .map((time: number, idx: number) => {
            if (time == null || idx >= streamsData.hrZones.length) return null
            return {
              name: streamsData.hrZones[idx]?.name || `Z${idx + 1}`,
              time,
              index: idx,
              min: streamsData.hrZones[idx]?.min,
              max: streamsData.hrZones[idx]?.max
            }
          })
          .filter(Boolean)
      }

      const savedSelection = userStore.user?.dashboardSettings?.mapSelectedStreams
      if (Array.isArray(savedSelection) && savedSelection.length > 0) {
        selectedStreamObjects.value = savedSelection.map((key: string) => ({
          label: getStreamMetadata(key).label,
          value: key
        }))
      } else {
        const initial: string[] = []
        if (streamsData.heartrate) initial.push('heartrate')
        if (streamsData.altitude) initial.push('altitude')
        if (streamsData.watts) initial.push('watts')
        if (streamsData.velocity) initial.push('velocity')
        selectedStreamObjects.value = availableStreamOptions.value.filter((option) =>
          initial.includes(option.value)
        )
      }

      void fetchPeakPowerWindows()
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'Failed to load workout analysis'
    } finally {
      loading.value = false
    }
  }

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (h > 0) return `${h}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return {
    api,
    loading,
    error,
    workout,
    lapSplits,
    detectedIntervals,
    detectedClimbs,
    peakPowerWindows,
    hrZones,
    segmentTab,
    hoverIndex,
    hoverSplit,
    zoomRange,
    selectedSegmentRange,
    selectedSegmentSource,
    selectedSegmentSummary,
    selectedSegmentLoading,
    selectedSegmentError,
    selectedStreamObjects,
    selectedStreamValues,
    selectedStreams: computed(() => selectedStreamObjects.value.map((s) => s.value)),
    analyzerMode,
    layoutMode,
    activeLibraryPanels,
    summaryPolylineCoordinates,
    availableStreamOptions,
    zoomedStreams,
    activeHighlightRange,
    hoverSplitRange,
    zoomedHoverIndex,
    zoomedActiveHighlightRange,
    selectedSegmentLabel,
    selectedSegmentMetricItems,
    entireWorkoutMetricItems,
    load,
    getStreamMetadata,
    onChartHover,
    onChartLeave,
    onChartZoom,
    onChartSelect,
    resetZoom,
    clearSelectedSegment,
    onSplitHover,
    onSplitLeave,
    selectLap,
    selectPeakWindow,
    selectTimeRange,
    addLibraryPanel,
    removeLibraryPanel,
    formatTime,
    fetchPeakPowerWindows
  }
}
