<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { formatDistanceToNow, isToday, isYesterday } from 'date-fns'

  const props = defineProps<{
    personalBests: any[]
  }>()

  const activeModality = ref('RUN')
  const activeMetric = ref('Time')

  const modalities = [
    { id: 'SWIM', label: 'Swim', icon: 'i-lucide-waves', color: 'cyan' },
    { id: 'CYCLE', label: 'Bike', icon: 'i-lucide-bike', color: 'green' },
    { id: 'RUN', label: 'Run', icon: 'i-lucide-footprints', color: 'blue' }
  ]

  const metricsByModality: Record<string, string[]> = {
    SWIM: ['Time', 'Pace', 'Heart Rate'],
    CYCLE: ['Power', 'Heart Rate'],
    RUN: ['Time', 'Heart Rate']
  }

  const availableMetrics = computed(() => {
    return metricsByModality[activeModality.value] || []
  })

  // Ensure activeMetric is valid when modality changes
  function setModality(mod: string) {
    activeModality.value = mod
    if (!metricsByModality[mod].includes(activeMetric.value)) {
      activeMetric.value = metricsByModality[mod][0]
    }
  }

  // Major milestones that should be "featured" heroes
  const heroTypes = ['RUN_5K', 'POWER_20M', 'SWIM_1500M']
  const featuredTypes = ['RUN_10K', 'POWER_1M', 'POWER_5M', 'SWIM_400M']

  const standardTrophies: Record<string, any[]> = {
    RUN: [
      { type: 'RUN_400M', unit: 's', category: 'RUN' },
      { type: 'RUN_800M', unit: 's', category: 'RUN' },
      { type: 'RUN_1K', unit: 's', category: 'RUN' },
      { type: 'RUN_1MI', unit: 's', category: 'RUN' },
      { type: 'RUN_5K', unit: 's', category: 'RUN' },
      { type: 'RUN_10K', unit: 's', category: 'RUN' },
      { type: 'RUN_HM', unit: 's', category: 'RUN' },
      { type: 'RUN_MARATHON', unit: 's', category: 'RUN' }
    ],
    CYCLE: [
      { type: 'POWER_5S', unit: 'W', category: 'CYCLE' },
      { type: 'POWER_1M', unit: 'W', category: 'CYCLE' },
      { type: 'POWER_3M', unit: 'W', category: 'CYCLE' },
      { type: 'POWER_6M', unit: 'W', category: 'CYCLE' },
      { type: 'POWER_20M', unit: 'W', category: 'CYCLE' },
      { type: 'POWER_60M', unit: 'W', category: 'CYCLE' },
      { type: 'POWER_90M', unit: 'W', category: 'CYCLE' }
    ],
    SWIM: [
      { type: 'SWIM_50M', unit: 's', category: 'SWIM' },
      { type: 'SWIM_100M', unit: 's', category: 'SWIM' },
      { type: 'SWIM_400M', unit: 's', category: 'SWIM' },
      { type: 'SWIM_1500M', unit: 's', category: 'SWIM' },
      { type: 'SWIM_2KM', unit: 's', category: 'SWIM' },
      { type: 'SWIM_5KM', unit: 's', category: 'SWIM' }
    ]
  }

  const pbsByCategory = computed(() => {
    const map: Record<string, any[]> = {}

    // Initialize map with standard trophies
    modalities.forEach((mod) => {
      map[mod.id] = [...(standardTrophies[mod.id] || [])].map((t) => ({
        ...t,
        isPlaceholder: true
      }))
    })

    if (props.personalBests) {
      props.personalBests.forEach((pb) => {
        if (!pb || !pb.category) return
        if (!map[pb.category]) map[pb.category] = []

        // Check if there is a placeholder to replace
        const placeholderIdx = map[pb.category].findIndex(
          (p: any) => p.type === pb.type && p.isPlaceholder
        )
        if (placeholderIdx !== -1) {
          map[pb.category][placeholderIdx] = { ...pb, isPlaceholder: false }
        } else {
          // If we allow arbitrary PBs (e.g. ELEVATION_GAIN), append them
          map[pb.category].push({ ...pb, isPlaceholder: false })
        }
      })
    }

    // Sort each category
    Object.keys(map).forEach((catId) => {
      map[catId].sort((a, b) => {
        // preserve standard order, or fallback to priority
        const aIdx = standardTrophies[catId]?.findIndex((t) => t.type === a.type) ?? 999
        const bIdx = standardTrophies[catId]?.findIndex((t) => t.type === b.type) ?? 999
        if (aIdx !== 999 && bIdx !== 999) return aIdx - bIdx

        const getPriority = (type: string) => {
          if (heroTypes.includes(type)) return 0
          if (featuredTypes.includes(type)) return 1
          return 2
        }
        return getPriority(a.type) - getPriority(b.type)
      })
    })

    return map
  })

  const activeTrophies = computed(() => {
    return pbsByCategory.value[activeModality.value] || []
  })

  // Distance mapping for pace calculations
  const distanceMap: Record<string, number> = {
    RUN_400M: 400,
    RUN_800M: 800,
    RUN_1K: 1000,
    RUN_1MI: 1609.34,
    RUN_5K: 5000,
    RUN_10K: 10000,
    RUN_HM: 21097.5,
    RUN_MARATHON: 42195,
    SWIM_50M: 50,
    SWIM_100M: 100,
    SWIM_400M: 400,
    SWIM_1500M: 1500,
    SWIM_2KM: 2000,
    SWIM_5KM: 5000
  }

  function getMetricValue(pb: any) {
    if (!pb) return { val: '--', unit: '' }
    if (pb.isPlaceholder) return { val: '--', unit: '' }

    if (activeMetric.value === 'Heart Rate') {
      const hr = pb.metadata?.maxHr || pb.workout?.maxHr
      return { val: hr ? hr.toString() : '--', unit: 'BPM' }
    }

    if (activeMetric.value === 'Pace') {
      const dist = pb.type ? distanceMap[pb.type] : 0
      if (!dist) return { val: '--', unit: '' }

      let paceSeconds = 0
      let paceUnit = ''

      if (pb.category === 'SWIM') {
        paceSeconds = pb.value / (dist / 100)
        paceUnit = '/100m'
      } else {
        paceSeconds = pb.value / (dist / 1000)
        paceUnit = '/km'
      }

      const mins = Math.floor(paceSeconds / 60) || 0
      const secs = Math.floor(paceSeconds % 60) || 0
      return { val: `${mins}:${secs.toString().padStart(2, '0')}`, unit: paceUnit }
    }

    if (activeMetric.value === 'Time') {
      const val = pb.value || 0
      const mins = Math.floor(val / 60)
      const secs = Math.floor(val % 60)
      if (mins >= 60) {
        const hrs = Math.floor(mins / 60)
        const rmins = mins % 60
        return {
          val: `${hrs}:${rmins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
          unit: ''
        }
      }
      return { val: `${mins}:${secs.toString().padStart(2, '0')}`, unit: '' }
    }

    if (activeMetric.value === 'Power') {
      return { val: `${Math.round(pb.value || 0)}`, unit: 'W' }
    }

    return { val: '--', unit: '' }
  }

  function formatType(type: string) {
    if (!type) return ''
    return type
      .replace(/_/g, ' ')
      .replace('RUN ', '')
      .replace('SWIM ', '')
      .replace('POWER ', 'Peak ')
      .replace('ELEVATION GAIN', 'Max Climb')
  }

  function getHumanDate(date?: string | Date) {
    if (!date) return 'Not yet achieved'
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return 'Not yet achieved'
      if (isToday(d)) return 'Today'
      if (isYesterday(d)) return 'Yesterday'
      return formatDistanceToNow(d, { addSuffix: true })
    } catch (e) {
      return ''
    }
  }

  function isRecent(date?: string | Date) {
    if (!date) return false
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return false
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return d > thirtyDaysAgo
    } catch (e) {
      return false
    }
  }

  function getSportIcon(pb: any) {
    if (!pb || !pb.type) return 'i-heroicons-trophy'
    if (pb.type.includes('POWER')) return 'i-lucide-bolt'
    if (pb.type.includes('ELEVATION')) return 'i-lucide-mountain'
    if (pb.category === 'RUN') return 'i-lucide-footprints'
    if (pb.category === 'CYCLE') return 'i-lucide-bike'
    if (pb.category === 'SWIM') return 'i-lucide-waves'
    return 'i-heroicons-trophy'
  }
</script>

<template>
  <div class="space-y-12">
    <!-- Filters Header -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-6 px-4 sm:px-0">
      <!-- Modality Bubble Buttons -->
      <div
        class="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-full border border-gray-200 dark:border-white/5"
      >
        <button
          v-for="mod in modalities"
          :key="mod.id"
          :class="[
            'flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300',
            activeModality === mod.id
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-white/10'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
          ]"
          @click="setModality(mod.id)"
        >
          <UIcon :name="mod.icon" class="w-5 h-5" />
          {{ mod.label }}
        </button>
      </div>

      <!-- Metric Filters -->
      <div class="flex items-center gap-2">
        <button
          v-for="metric in availableMetrics"
          :key="metric"
          :class="[
            'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border',
            activeMetric === metric
              ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-500/20'
              : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'
          ]"
          @click="activeMetric = metric"
        >
          {{ metric }}
        </button>
      </div>
    </div>

    <!-- Active Modality Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="(pb, index) in activeTrophies"
        :key="pb.id || pb.type + '-' + index"
        class="floating-card-base grain-overlay p-10 rounded-[40px] flex flex-col justify-between h-full group !bg-white dark:!bg-[#111111] !border-gray-200 dark:!border-white/5"
        :class="{ 'opacity-60': pb.isPlaceholder }"
      >
        <!-- Hero Glow & Patterns -->
        <div
          v-if="heroTypes.includes(pb.type) && !pb.isPlaceholder"
          class="absolute -top-32 -right-32 w-80 h-80 bg-amber-400/10 blur-[100px] rounded-full -z-10"
        />

        <div class="relative">
          <!-- Top Header: Icon + Badge -->
          <div class="flex items-start justify-between mb-10">
            <div
              class="p-5 rounded-[24px] bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-white/5 group-hover:border-primary-500/40 transition-colors duration-500"
            >
              <UIcon :name="getSportIcon(pb)" class="w-8 h-8 text-primary-500" />
            </div>

            <div v-if="!pb.isPlaceholder && isRecent(pb.date)" class="relative group/badge">
              <div
                class="relative flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-400 text-black overflow-hidden shadow-[0_0_20px_rgba(251,191,36,0.4)] animate-neon-pulse"
              >
                <!-- Holographic Shimmer Effect -->
                <div
                  class="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12"
                />
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5 animate-spin-slow" />
                <span class="text-xs font-black uppercase tracking-[0.2em]">New Record</span>
              </div>
            </div>
          </div>

          <!-- Value & Label -->
          <div class="space-y-3">
            <div
              class="text-[11px] font-black text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em] ml-1"
            >
              {{ formatType(pb.type) }}
            </div>
            <div class="flex items-baseline gap-4">
              <span
                class="text-7xl lg:text-8xl font-black text-gray-900 dark:text-white tracking-tighter italic tabular-nums font-athletic leading-none drop-shadow-2xl"
              >
                {{ getMetricValue(pb).val }}
              </span>
              <span
                v-if="getMetricValue(pb).unit"
                class="text-xl font-black text-gray-500 dark:text-gray-600 uppercase italic tracking-widest"
              >
                {{ getMetricValue(pb).unit }}
              </span>
            </div>
          </div>

          <!-- Secondary Stats / Context -->
          <div
            v-if="!pb.isPlaceholder && (pb.metadata || pb.workout)"
            class="mt-10 flex flex-wrap gap-8 ml-1"
          >
            <div
              v-if="pb.metadata?.avgHr || pb.workout?.averageHr"
              class="flex items-center gap-3 group/stat"
            >
              <div
                class="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/5 group-hover/stat:border-red-500/30 transition-colors"
              >
                <UIcon name="i-heroicons-heart" class="w-6 h-6 text-red-500/60" />
              </div>
              <div>
                <div
                  class="text-[9px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-widest mb-0.5"
                >
                  Avg Heart Rate
                </div>
                <span class="text-base font-black text-gray-700 dark:text-gray-400 tabular-nums">
                  {{ pb.metadata?.avgHr || pb.workout?.averageHr }}
                  <span class="text-[10px] text-gray-500 dark:text-gray-600">BPM</span>
                </span>
              </div>
            </div>
            <div
              v-if="pb.metadata?.avgCadence || pb.workout?.averageCadence"
              class="flex items-center gap-3 group/stat"
            >
              <div
                class="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/5 group-hover/stat:border-blue-500/30 transition-colors"
              >
                <UIcon name="i-lucide-rotate-cw" class="w-6 h-6 text-blue-500/60" />
              </div>
              <div>
                <div
                  class="text-[9px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-widest mb-0.5"
                >
                  Avg Cadence
                </div>
                <span class="text-base font-black text-gray-700 dark:text-gray-400 tabular-nums">
                  {{ pb.metadata?.avgCadence || pb.workout?.averageCadence }}
                  <span class="text-[10px] text-gray-500 dark:text-gray-600">RPM</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer: Date + Action -->
        <div
          class="mt-14 pt-8 border-t border-gray-200 dark:border-white/5 flex items-end justify-between ml-1"
        >
          <div class="flex flex-col gap-1.5">
            <div
              class="text-[10px] font-black text-gray-500 dark:text-gray-600 uppercase tracking-[0.3em]"
            >
              {{ pb.isPlaceholder ? 'Status' : 'Achieved' }}
            </div>
            <div class="text-base font-black text-gray-700 dark:text-gray-500 italic">
              {{ getHumanDate(pb.date) }}
            </div>
          </div>

          <UButton
            v-if="pb.workoutId"
            :to="`/workouts/${pb.workoutId}`"
            icon="i-heroicons-arrow-right"
            color="neutral"
            variant="ghost"
            size="xl"
            class="rounded-full h-14 w-14 flex items-center justify-center transition-all duration-500 hover:bg-primary-500 hover:text-white hover:scale-110 shadow-lg hover:shadow-primary-500/20 group/arrow"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @keyframes neon-pulse {
    0%,
    100% {
      filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.4));
    }
    50% {
      filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.8));
    }
  }

  .animate-neon-pulse {
    animation: neon-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .animate-spin-slow {
    animation: spin 6s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Fallback for athletic font if not globally defined */
  .font-athletic {
    font-family:
      'Inter var',
      'Inter',
      system-ui,
      -apple-system,
      sans-serif;
    font-stretch: condensed;
  }
</style>
