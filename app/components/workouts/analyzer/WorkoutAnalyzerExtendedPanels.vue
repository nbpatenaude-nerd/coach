<template>
  <div class="space-y-3">
    <div
      v-if="panels.includes('time-in-zones')"
      class="rounded-xl border border-default/70 bg-default p-3"
    >
      <div class="mb-3 flex items-center justify-between">
        <h4 class="text-[10px] font-black uppercase tracking-widest text-muted">Time in Zones</h4>
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="$emit('remove', 'time-in-zones')"
        />
      </div>
      <div v-if="hrZones.length" class="flex h-40 items-end gap-2">
        <div
          v-for="zone in hrZones"
          :key="zone.index"
          class="flex min-w-0 flex-1 flex-col items-center gap-1"
        >
          <div
            class="w-full rounded-t bg-red-500/80"
            :style="{ height: `${zoneBarHeight(zone.time)}%` }"
            :title="`${zone.name}: ${formatMinutes(zone.time)}`"
          />
          <span class="truncate text-[9px] font-bold text-muted">{{ zone.name }}</span>
        </div>
      </div>
      <p v-else class="py-8 text-center text-xs text-muted">No HR zone data for this workout</p>
    </div>

    <div
      v-if="panels.includes('peak-curve')"
      class="rounded-xl border border-default/70 bg-default p-3"
    >
      <div class="mb-3 flex items-center justify-between">
        <h4 class="text-[10px] font-black uppercase tracking-widest text-muted">Peak Curve</h4>
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="$emit('remove', 'peak-curve')"
        />
      </div>
      <div v-if="peaks.length" class="flex h-40 items-end gap-1">
        <div
          v-for="peak in peaks.slice(0, 12)"
          :key="peak.duration"
          class="flex min-w-0 flex-1 flex-col items-center gap-1"
        >
          <div
            class="w-full rounded-t bg-violet-500/80"
            :style="{ height: `${peakBarHeight(peak.power)}%` }"
            :title="`${peak.durationLabel || peak.duration}: ${peak.power}W`"
          />
          <span class="truncate text-[8px] font-bold text-muted">{{
            peak.durationLabel || peak.duration
          }}</span>
        </div>
      </div>
      <p v-else class="py-8 text-center text-xs text-muted">No peak power windows available</p>
    </div>

    <div
      v-if="panels.includes('xy-scatter')"
      class="rounded-xl border border-default/70 bg-default p-3"
    >
      <div class="mb-3 flex items-center justify-between gap-2">
        <h4 class="text-[10px] font-black uppercase tracking-widest text-muted">Custom XY</h4>
        <div class="flex items-center gap-2">
          <USelect v-model="xKey" :items="axisOptions" value-key="value" size="xs" class="w-28" />
          <span class="text-[10px] text-muted">vs</span>
          <USelect v-model="yKey" :items="axisOptions" value-key="value" size="xs" class="w-28" />
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="$emit('remove', 'xy-scatter')"
          />
        </div>
      </div>
      <div class="relative h-48 overflow-hidden rounded-lg border border-default/50 bg-muted/10">
        <svg viewBox="0 0 100 100" class="h-full w-full" preserveAspectRatio="none">
          <circle
            v-for="(pt, idx) in scatterPoints"
            :key="idx"
            :cx="pt.x"
            :cy="pt.y"
            r="0.7"
            class="fill-primary/70"
          />
        </svg>
        <p
          v-if="!scatterPoints.length"
          class="absolute inset-0 flex items-center justify-center text-xs text-muted"
        >
          Need both streams to plot
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    panels: string[]
    workout: any
    hrZones: any[]
    peaks: any[]
    selectionRange: [number, number] | null
  }>()

  defineEmits<{ remove: [string] }>()

  const xKey = ref('heartrate')
  const yKey = ref('velocity')

  const axisOptions = [
    { label: 'Heart Rate', value: 'heartrate' },
    { label: 'Pace/Speed', value: 'velocity' },
    { label: 'Power', value: 'watts' },
    { label: 'Cadence', value: 'cadence' },
    { label: 'Altitude', value: 'altitude' }
  ]

  const maxZoneTime = computed(() => Math.max(1, ...props.hrZones.map((z) => Number(z.time) || 0)))
  const maxPeakPower = computed(() => Math.max(1, ...props.peaks.map((p) => Number(p.power) || 0)))

  function zoneBarHeight(time: number) {
    return Math.max(4, Math.round((Number(time) / maxZoneTime.value) * 100))
  }

  function peakBarHeight(power: number) {
    return Math.max(4, Math.round((Number(power) / maxPeakPower.value) * 100))
  }

  function formatMinutes(seconds: number) {
    return `${Math.round((Number(seconds) || 0) / 60)} min`
  }

  const scatterPoints = computed(() => {
    const streams = props.workout?.streams
    if (!streams) return []
    const xs = streams[xKey.value]
    const ys = streams[yKey.value]
    if (!Array.isArray(xs) || !Array.isArray(ys)) return []

    let start = 0
    let end = Math.min(xs.length, ys.length) - 1
    if (props.selectionRange) {
      start = Math.max(0, props.selectionRange[0])
      end = Math.min(end, props.selectionRange[1])
    }

    const sample: Array<{ x: number; y: number }> = []
    const step = Math.max(1, Math.floor((end - start) / 400))
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    const raw: Array<{ x: number; y: number }> = []

    for (let i = start; i <= end; i += step) {
      const x = Number(xs[i])
      const y = Number(ys[i])
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue
      raw.push({ x, y })
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }

    const dx = maxX - minX || 1
    const dy = maxY - minY || 1
    for (const pt of raw) {
      sample.push({
        x: ((pt.x - minX) / dx) * 96 + 2,
        y: 98 - ((pt.y - minY) / dy) * 96
      })
    }
    return sample
  })
</script>
