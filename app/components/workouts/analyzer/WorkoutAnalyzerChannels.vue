<template>
  <div class="flex h-full min-h-0 flex-col">
    <div
      class="flex flex-col gap-2 border-b border-default/60 bg-muted/10 p-3 sm:flex-row sm:items-start sm:justify-between"
    >
      <div class="flex min-w-0 flex-col gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-[10px] font-black uppercase tracking-widest text-muted">Channels</h3>
          <UButton
            v-if="hasZoom"
            icon="i-heroicons-magnifying-glass-minus"
            size="xs"
            color="neutral"
            variant="outline"
            @click="$emit('reset-zoom')"
          >
            Reset Zoom
          </UButton>
          <UButton
            v-if="hasSelection"
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="outline"
            @click="$emit('clear-selection')"
          >
            Clear Selection
          </UButton>
          <div
            v-if="!compact"
            class="inline-flex items-center rounded-lg border border-default/60 p-0.5"
          >
            <UButton
              size="xs"
              color="neutral"
              :variant="layoutMode === 'default' ? 'soft' : 'ghost'"
              @click="$emit('update:layout-mode', 'default')"
            >
              Overlay
            </UButton>
            <UButton
              size="xs"
              color="neutral"
              :variant="layoutMode === 'chart-focus' ? 'soft' : 'ghost'"
              @click="$emit('update:layout-mode', 'chart-focus')"
            >
              Stacked
            </UButton>
          </div>
        </div>

        <!-- Timeline-style channel pills -->
        <div class="flex flex-wrap gap-1.5">
          <UButton
            v-for="option in availableOptions"
            :key="option.value"
            size="xs"
            :color="isSelected(option.value) ? 'primary' : 'neutral'"
            :variant="isSelected(option.value) ? 'solid' : 'ghost'"
            class="font-black uppercase tracking-widest text-[9px] px-2.5"
            @click="toggleStream(option)"
          >
            {{ option.label }}
          </UButton>
        </div>
      </div>
      <div v-if="cursorLabel" class="shrink-0 text-[10px] font-black uppercase text-primary">
        {{ cursorLabel }}
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto p-3">
      <div
        v-if="!streamObjects.length"
        class="flex h-40 flex-col items-center justify-center text-muted"
      >
        <UIcon name="i-heroicons-chart-bar" class="mb-2 h-10 w-10 opacity-30" />
        <p class="text-[10px] font-black uppercase tracking-widest">Select streams to analyze</p>
      </div>

      <div
        v-else-if="layoutMode === 'default' && zoomedStreams?.time?.length"
        class="h-[260px] sm:h-[300px]"
      >
        <client-only>
          <StreamChart
            :datasets="
              streamObjects.map((s) => ({
                label: meta(s.value).label,
                data: zoomedStreams[s.value],
                color: meta(s.value).color,
                unit: meta(s.value).unit
              }))
            "
            :labels="zoomedStreams.time"
            height-class="h-full"
            :highlight-index="hoverIndex"
            :highlight-range="highlightRange"
            drag-mode="select"
            @chart-hover="$emit('hover', $event)"
            @chart-leave="$emit('leave')"
            @chart-zoom="$emit('zoom', $event)"
            @chart-select="$emit('select', $event)"
          />
        </client-only>
      </div>

      <div v-else class="space-y-0">
        <div
          v-for="(streamObject, idx) in streamObjects"
          :key="streamObject.value"
          class="border-b border-default/50 pb-1 pt-1 last:border-0"
        >
          <div class="mb-0 flex items-center gap-2 px-1">
            <div
              class="h-2 w-2 rounded-full"
              :style="{ backgroundColor: meta(streamObject.value).color }"
            />
            <span class="text-[9px] font-black uppercase tracking-widest text-muted">
              {{ meta(streamObject.value).label }}
            </span>
            <UButton
              icon="i-heroicons-x-mark"
              size="xs"
              color="neutral"
              variant="ghost"
              class="ml-auto"
              @click="removeStream(streamObject.value)"
            />
          </div>
          <div v-if="zoomedStreams?.time?.length" class="h-36">
            <client-only>
              <StreamChart
                :label="meta(streamObject.value).label"
                :data-points="zoomedStreams[streamObject.value]"
                :labels="zoomedStreams.time"
                :color="meta(streamObject.value).color"
                :y-axis-label="meta(streamObject.value).unit"
                height-class="h-36"
                :highlight-index="hoverIndex"
                :highlight-range="highlightRange"
                :show-x-axis="idx === streamObjects.length - 1"
                :fixed-y-axis-width="72"
                drag-mode="select"
                @chart-hover="$emit('hover', $event)"
                @chart-leave="$emit('leave')"
                @chart-zoom="$emit('zoom', $event)"
                @chart-select="$emit('select', $event)"
              />
            </client-only>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import StreamChart from '~/components/charts/streams/BaseStreamChart.vue'
  import { getStreamMetadata } from '~/composables/useWorkoutAnalyzerState'
  import type { AnalyzerLayoutMode, StreamOption } from '~/composables/useWorkoutAnalyzerState'

  const props = withDefaults(
    defineProps<{
      streamObjects: StreamOption[]
      streamValues: string[]
      availableOptions: StreamOption[]
      zoomedStreams: any
      hoverIndex: number | null
      highlightRange: [number, number] | null
      layoutMode?: AnalyzerLayoutMode
      hasZoom?: boolean
      hasSelection?: boolean
      cursorLabel?: string
      compact?: boolean
    }>(),
    {
      layoutMode: 'chart-focus',
      hasZoom: false,
      hasSelection: false,
      cursorLabel: '',
      compact: false
    }
  )

  const emit = defineEmits<{
    'update:stream-objects': [StreamOption[]]
    'update:stream-values': [string[]]
    'update:layout-mode': [AnalyzerLayoutMode]
    hover: [number]
    leave: []
    zoom: [[number, number]]
    select: [[number, number]]
    'reset-zoom': []
    'clear-selection': []
  }>()

  function meta(key: string) {
    return getStreamMetadata(key)
  }

  function isSelected(value: string) {
    return props.streamValues.includes(value)
  }

  function toggleStream(option: StreamOption) {
    if (isSelected(option.value)) {
      // Keep at least one channel selected
      if (props.streamValues.length <= 1) return
      emit(
        'update:stream-objects',
        props.streamObjects.filter((s) => s.value !== option.value)
      )
      return
    }
    emit('update:stream-objects', [...props.streamObjects, option])
  }

  function removeStream(value: string) {
    if (props.streamObjects.length <= 1) return
    emit(
      'update:stream-objects',
      props.streamObjects.filter((s) => s.value !== value)
    )
  }
</script>
