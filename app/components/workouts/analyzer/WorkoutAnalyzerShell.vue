<template>
  <div class="flex h-full min-h-0 flex-col gap-3">
    <div v-if="loading" class="flex flex-1 items-center justify-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-primary-500" />
    </div>
    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="error"
      variant="soft"
      :title="error"
    />
    <template v-else>
      <div
        class="flex flex-col gap-3 rounded-xl border border-default/70 bg-default/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0">
          <div class="truncate text-lg font-black text-highlighted">
            {{ workout?.title || 'Workout Analysis' }}
          </div>
          <div class="mt-1 flex flex-wrap items-center gap-3 text-xs font-bold text-muted">
            <span>{{ formatTime(workout?.durationSec || 0) }}</span>
            <span v-if="workout?.distanceMeters">
              {{ (workout.distanceMeters / 1000).toFixed(1) }} km
            </span>
            <span v-if="workout?.tss != null">{{ Math.round(workout.tss) }} TSS</span>
            <span v-if="workout?.type">{{ workout.type }}</span>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div class="inline-flex items-center rounded-xl border border-default/70 bg-muted/20 p-1">
            <UButton
              size="xs"
              color="neutral"
              :variant="analyzerMode === 'classic' ? 'soft' : 'ghost'"
              @click="analyzerMode = 'classic'"
            >
              Classic
            </UButton>
            <UButton
              size="xs"
              color="neutral"
              :variant="analyzerMode === 'analyze360' ? 'soft' : 'ghost'"
              @click="analyzerMode = 'analyze360'"
            >
              Analyze 360
            </UButton>
          </div>
          <slot name="actions" />
        </div>
      </div>

      <!-- Classic layout -->
      <div
        v-if="analyzerMode === 'classic'"
        class="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12 lg:grid-rows-[minmax(240px,0.42fr)_minmax(280px,0.58fr)]"
      >
        <div
          class="min-h-[240px] overflow-hidden rounded-xl border border-default/70 bg-muted/10 lg:col-span-8 lg:row-start-1"
        >
          <UiWorkoutMap
            :coordinates="workout?.streams?.latlng || summaryPolylineCoordinates"
            :streams="workout?.streams"
            :loading="loading"
            :workout-id="workout?.id"
            :highlight-index="hoverIndex"
            :highlight-range="activeHighlightRange"
            :interactive="true"
            class="!h-full !rounded-none !border-0"
          />
        </div>

        <div
          class="flex min-h-[280px] flex-col overflow-hidden rounded-xl border border-default/70 bg-default lg:col-span-4 lg:row-span-2"
        >
          <WorkoutAnalyzerSelectionPanel
            :has-selection="!!selectedSegmentRange"
            :selection-label="selectedSegmentLabel"
            :selection-metrics="selectedSegmentMetricItems"
            :entire-metrics="entireWorkoutMetricItems"
            :loading="selectedSegmentLoading"
            :error="selectedSegmentError"
            @clear="clearSelectedSegment"
          />
          <WorkoutAnalyzerLapsPanel
            class="min-h-0 flex-1"
            :laps="lapSplits"
            :intervals="detectedIntervals"
            :climbs="detectedClimbs"
            :peaks="peakPowerWindows"
            :zones="hrZones"
            :active-tab="segmentTab"
            :selected-lap="selectedLapNumber"
            @update:active-tab="segmentTab = $event"
            @hover="onSplitHover"
            @leave="onSplitLeave"
            @select-lap="selectLap"
            @select-peak="selectPeakWindow"
          />
        </div>

        <div
          class="flex min-h-[280px] flex-col overflow-hidden rounded-xl border border-default/70 bg-default lg:col-span-8 lg:row-start-2"
        >
          <WorkoutAnalyzerChannels
            :stream-objects="selectedStreamObjects"
            :stream-values="selectedStreamValues"
            :available-options="availableStreamOptions"
            :zoomed-streams="zoomedStreams"
            :hover-index="zoomedHoverIndex"
            :highlight-range="zoomedActiveHighlightRange"
            :layout-mode="layoutMode"
            :has-zoom="!!zoomRange"
            :has-selection="!!selectedSegmentRange"
            :cursor-label="cursorLabel"
            @update:stream-objects="selectedStreamObjects = $event"
            @update:stream-values="selectedStreamValues = $event"
            @update:layout-mode="layoutMode = $event"
            @hover="onChartHover"
            @leave="onChartLeave"
            @zoom="onChartZoom"
            @select="onChartSelect"
            @reset-zoom="resetZoom"
            @clear-selection="clearSelectedSegment"
          />
        </div>
      </div>

      <!-- Analyze 360 -->
      <div v-else class="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12">
        <aside
          class="space-y-3 rounded-xl border border-default/70 bg-default p-3 lg:col-span-2 lg:overflow-y-auto"
        >
          <h3 class="text-[10px] font-black uppercase tracking-widest text-muted">Workout Stats</h3>
          <div
            v-for="metric in entireWorkoutMetricItems"
            :key="metric.label"
            class="rounded-lg border border-default/60 bg-muted/10 px-2.5 py-2"
          >
            <div class="text-[9px] font-black uppercase tracking-widest text-muted">
              {{ metric.label }}
            </div>
            <div class="text-sm font-black tabular-nums text-highlighted">{{ metric.value }}</div>
          </div>
          <div v-if="selectedSegmentRange" class="border-t border-default/60 pt-3">
            <h3 class="text-[10px] font-black uppercase tracking-widest text-primary">Selection</h3>
            <p class="mt-1 text-xs font-bold text-highlighted">{{ selectedSegmentLabel }}</p>
            <div class="mt-2 space-y-1.5">
              <div
                v-for="metric in selectedSegmentMetricItems"
                :key="`sel-${metric.label}`"
                class="flex justify-between gap-2 text-xs"
              >
                <span class="text-muted">{{ metric.label }}</span>
                <span class="font-bold tabular-nums">{{ metric.value }}</span>
              </div>
            </div>
          </div>
        </aside>

        <section class="flex min-h-0 flex-col gap-3 lg:col-span-7 lg:overflow-y-auto">
          <div class="min-h-[220px] overflow-hidden rounded-xl border border-default/70">
            <UiWorkoutMap
              v-if="activeLibraryPanels.includes('map')"
              :coordinates="workout?.streams?.latlng || summaryPolylineCoordinates"
              :streams="workout?.streams"
              :loading="loading"
              :workout-id="workout?.id"
              :highlight-index="hoverIndex"
              :highlight-range="activeHighlightRange"
              :interactive="true"
              class="!h-[220px] !rounded-none !border-0"
            />
          </div>

          <div class="rounded-xl border border-default/70 bg-default">
            <WorkoutAnalyzerChannels
              :stream-objects="selectedStreamObjects"
              :stream-values="selectedStreamValues"
              :available-options="availableStreamOptions"
              :zoomed-streams="zoomedStreams"
              :hover-index="zoomedHoverIndex"
              :highlight-range="zoomedActiveHighlightRange"
              layout-mode="chart-focus"
              :has-zoom="!!zoomRange"
              :has-selection="!!selectedSegmentRange"
              :cursor-label="cursorLabel"
              compact
              @update:stream-objects="selectedStreamObjects = $event"
              @update:stream-values="selectedStreamValues = $event"
              @hover="onChartHover"
              @leave="onChartLeave"
              @zoom="onChartZoom"
              @select="onChartSelect"
              @reset-zoom="resetZoom"
              @clear-selection="clearSelectedSegment"
            />
          </div>

          <WorkoutAnalyzerExtendedPanels
            :panels="activeLibraryPanels"
            :workout="workout"
            :hr-zones="hrZones"
            :peaks="peakPowerWindows"
            :selection-range="selectedSegmentRange"
            @remove="removeLibraryPanel"
          />

          <div class="rounded-xl border border-default/70 bg-default">
            <WorkoutAnalyzerLapsPanel
              :laps="lapSplits"
              :intervals="detectedIntervals"
              :climbs="detectedClimbs"
              :peaks="peakPowerWindows"
              :zones="hrZones"
              :active-tab="segmentTab"
              :selected-lap="selectedLapNumber"
              rich
              @update:active-tab="segmentTab = $event"
              @hover="onSplitHover"
              @leave="onSplitLeave"
              @select-lap="selectLap"
              @select-peak="selectPeakWindow"
            />
          </div>
        </section>

        <aside class="lg:col-span-3 lg:overflow-y-auto">
          <WorkoutAnalyzerChartsLibrary
            :active-panels="activeLibraryPanels"
            @add="addLibraryPanel"
            @remove="removeLibraryPanel"
          />
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { WorkoutAnalysisScope } from '~/utils/workoutAnalysisApi'
  import WorkoutAnalyzerChannels from '~/components/workouts/analyzer/WorkoutAnalyzerChannels.vue'
  import WorkoutAnalyzerSelectionPanel from '~/components/workouts/analyzer/WorkoutAnalyzerSelectionPanel.vue'
  import WorkoutAnalyzerLapsPanel from '~/components/workouts/analyzer/WorkoutAnalyzerLapsPanel.vue'
  import WorkoutAnalyzerChartsLibrary from '~/components/workouts/analyzer/WorkoutAnalyzerChartsLibrary.vue'
  import WorkoutAnalyzerExtendedPanels from '~/components/workouts/analyzer/WorkoutAnalyzerExtendedPanels.vue'

  const props = defineProps<{
    workoutId: string
    scope: WorkoutAnalysisScope
  }>()

  const state = useWorkoutAnalyzerState({
    workoutId: props.workoutId,
    scope: props.scope
  })

  const {
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
    selectedSegmentRange,
    selectedSegmentSource,
    selectedSegmentLoading,
    selectedSegmentError,
    selectedStreamObjects,
    selectedStreamValues,
    analyzerMode,
    layoutMode,
    activeLibraryPanels,
    summaryPolylineCoordinates,
    availableStreamOptions,
    zoomedStreams,
    activeHighlightRange,
    zoomedHoverIndex,
    zoomedActiveHighlightRange,
    selectedSegmentLabel,
    selectedSegmentMetricItems,
    entireWorkoutMetricItems,
    zoomRange,
    load,
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
    addLibraryPanel,
    removeLibraryPanel,
    formatTime
  } = state

  const cursorLabel = computed(() => {
    if (hoverIndex.value === null || !workout.value?.streams?.time) return ''
    const t = formatTime(workout.value.streams.time[hoverIndex.value] || 0)
    const parts = [`T: ${t}`]
    const hr = workout.value.streams.heartrate?.[hoverIndex.value]
    if (hr != null) parts.push(`${hr} bpm`)
    const alt = workout.value.streams.altitude?.[hoverIndex.value]
    if (alt != null) parts.push(`${Math.round(alt)} m`)
    return parts.join(' · ')
  })

  const selectedLapNumber = computed(() =>
    selectedSegmentSource.value?.type === 'lap' ? selectedSegmentSource.value.lap : null
  )

  onMounted(() => {
    void load()
  })

  defineExpose({
    loading,
    error,
    workout,
    reload: load
  })
</script>
