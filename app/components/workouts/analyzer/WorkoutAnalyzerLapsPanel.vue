<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="border-b border-default/60 px-2 pt-2">
      <UTabs
        :model-value="activeTab"
        :items="tabItems"
        variant="link"
        class="min-w-max"
        @update:model-value="$emit('update:active-tab', String($event))"
      />
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto">
      <table v-if="activeTab === 'laps'" class="min-w-full divide-y divide-default/50">
        <thead class="sticky top-0 z-10 bg-muted/40 backdrop-blur-sm">
          <tr>
            <th class="px-3 py-2 text-left text-[9px] font-black uppercase text-muted">Lap</th>
            <th class="px-3 py-2 text-left text-[9px] font-black uppercase text-muted">Time</th>
            <th class="px-3 py-2 text-left text-[9px] font-black uppercase text-muted">Pace</th>
            <th v-if="rich" class="px-3 py-2 text-left text-[9px] font-black uppercase text-muted">
              Dist
            </th>
            <th v-if="rich" class="px-3 py-2 text-left text-[9px] font-black uppercase text-muted">
              Avg HR
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default/40">
          <tr
            v-for="split in laps"
            :key="split.lap"
            class="cursor-pointer transition-colors hover:bg-muted/30"
            :class="selectedLap === split.lap ? 'bg-primary/10' : ''"
            @mouseenter="$emit('hover', split)"
            @mouseleave="$emit('leave')"
            @click="$emit('select-lap', split)"
          >
            <td class="px-3 py-2 text-xs font-black">#{{ split.lap }}</td>
            <td class="px-3 py-2 text-xs tabular-nums text-muted">
              {{ formatDuration(split.time) }}
            </td>
            <td class="px-3 py-2 text-xs tabular-nums text-muted">{{ split.pace || '-' }}</td>
            <td v-if="rich" class="px-3 py-2 text-xs tabular-nums text-muted">
              {{ formatDist(split.distance) }}
            </td>
            <td v-if="rich" class="px-3 py-2 text-xs tabular-nums text-muted">
              {{ split.averageHeartRate ? Math.round(split.averageHeartRate) : '-' }}
            </td>
          </tr>
          <tr v-if="!laps.length">
            <td colspan="5" class="px-3 py-6 text-center text-xs text-muted">No laps available</td>
          </tr>
        </tbody>
      </table>

      <div v-else-if="activeTab === 'intervals'" class="divide-y divide-default/40">
        <button
          v-for="(interval, idx) in intervals"
          :key="idx"
          type="button"
          class="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-muted/30"
          @mouseenter="$emit('hover', interval)"
          @mouseleave="$emit('leave')"
          @click="
            $emit('select-peak', {
              startTime: interval.start_time ?? interval.startTime,
              endTime: interval.end_time ?? interval.endTime,
              durationLabel: `Interval ${idx + 1}`,
              duration: 0
            })
          "
        >
          <span class="font-bold">Interval {{ idx + 1 }}</span>
          <span class="tabular-nums text-muted">{{ interval.duration || '-' }}</span>
        </button>
        <p v-if="!intervals.length" class="px-3 py-6 text-center text-xs text-muted">
          No intervals detected
        </p>
      </div>

      <div v-else-if="activeTab === 'peaks'" class="divide-y divide-default/40">
        <button
          v-for="peak in peaks"
          :key="`${peak.duration}-${peak.startTime}`"
          type="button"
          class="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-muted/30"
          @click="$emit('select-peak', peak)"
        >
          <span class="font-bold">{{ peak.durationLabel || `${peak.duration}s` }}</span>
          <span class="tabular-nums text-muted">{{ peak.power }}W</span>
        </button>
        <p v-if="!peaks.length" class="px-3 py-6 text-center text-xs text-muted">No peak windows</p>
      </div>

      <div v-else-if="activeTab === 'climbs'" class="divide-y divide-default/40">
        <button
          v-for="(climb, idx) in climbs"
          :key="idx"
          type="button"
          class="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-muted/30"
          @mouseenter="$emit('hover', climb)"
          @mouseleave="$emit('leave')"
        >
          <span class="font-bold">Climb {{ idx + 1 }}</span>
          <span class="tabular-nums text-muted">{{ climb.elevationGain || '-' }} m</span>
        </button>
        <p v-if="!climbs.length" class="px-3 py-6 text-center text-xs text-muted">No climbs</p>
      </div>

      <div v-else class="space-y-2 p-3">
        <div
          v-for="zone in zones"
          :key="zone.index"
          class="flex items-center justify-between rounded-lg border border-default/50 px-2.5 py-2 text-xs"
        >
          <span class="font-bold">{{ zone.name }}</span>
          <span class="tabular-nums text-muted">{{ formatDuration(zone.time) }}</span>
        </div>
        <p v-if="!zones.length" class="py-4 text-center text-xs text-muted">No zone data</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      laps: any[]
      intervals: any[]
      climbs: any[]
      peaks: any[]
      zones: any[]
      activeTab: string
      selectedLap?: number | null
      rich?: boolean
    }>(),
    {
      selectedLap: null,
      rich: false
    }
  )

  defineEmits<{
    'update:active-tab': [string]
    hover: [any]
    leave: []
    'select-lap': [any]
    'select-peak': [any]
  }>()

  const tabItems = [
    { label: 'Laps', value: 'laps' },
    { label: 'Intervals', value: 'intervals' },
    { label: 'Peaks', value: 'peaks' },
    { label: 'Climbs', value: 'climbs' },
    { label: 'Zones', value: 'zones' }
  ]

  function formatDuration(seconds: number) {
    const s = Math.max(0, Math.round(Number(seconds) || 0))
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${m}:${r.toString().padStart(2, '0')}`
  }

  function formatDist(meters: number) {
    if (!meters) return '-'
    return meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${Math.round(meters)} m`
  }
</script>
