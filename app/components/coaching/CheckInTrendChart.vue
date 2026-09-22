<template>
  <div class="space-y-4">
    <!-- Avg / min / max strip -->
    <div
      v-if="stats.length"
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2"
    >
      <div
        v-for="stat in stats"
        :key="stat.fieldId"
        class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 px-3 py-2"
      >
        <div class="flex items-center gap-1.5 mb-1">
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: stat.color }" />
          <p class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate">
            {{ stat.shortTitle }}
          </p>
        </div>
        <p class="text-xl font-bold tabular-nums" :style="{ color: stat.color }">
          {{ stat.sampleCount ? stat.avg.toFixed(1) : '—' }}
        </p>
        <p v-if="stat.sampleCount" class="text-[10px] text-gray-400 mt-0.5">
          avg · {{ stat.min }}–{{ stat.max }}
        </p>
      </div>
    </div>

    <div
      class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 sm:p-4"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {{ subtitle }}
          </p>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="field in numericFields"
            :key="field.id"
            type="button"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] border transition-colors"
            :class="
              visible[field.id]
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-400 border-gray-200 dark:border-gray-700'
            "
            :style="
              visible[field.id]
                ? {
                    borderColor: fieldColor(field.id),
                    backgroundColor: fieldColor(field.id) + '22'
                  }
                : undefined
            "
            @click="toggleField(field.id)"
          >
            <UIcon
              :name="visible[field.id] ? 'i-lucide-eye' : 'i-lucide-eye-off'"
              class="w-3 h-3"
            />
            {{ field.shortTitle }}
          </button>
        </div>
      </div>

      <div
        v-if="timeline.length < 2"
        class="h-48 flex items-center justify-center text-center px-4"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Need at least two weekly check-ins to draw a trend.
        </p>
      </div>
      <div v-else class="h-64 sm:h-80">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, watch } from 'vue'
  import { Line } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
  } from 'chart.js'
  import type {
    CheckInFormDefinition,
    aggregateCheckInFieldStats,
    buildCheckInTimeline,
    checkInFieldColor,
    checkInNumericFields,
    resolveCheckInFormFromRows,
    type CheckInChartRow
  } from '~~/shared/check-in'

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

  const props = withDefaults(
    defineProps<{
      rows: CheckInChartRow[]
      title?: string
      subtitle?: string
      /** Max series visible by default (rest toggled off until clicked). */
      defaultVisibleCount?: number
    }>(),
    {
      title: 'Trends over time',
      subtitle: '1–10 ratings across weekly submissions',
      defaultVisibleCount: 5
    }
  )

  const form = computed<CheckInFormDefinition>(() => resolveCheckInFormFromRows(props.rows))
  const numericFields = computed(() => checkInNumericFields(form.value))
  const stats = computed(() => aggregateCheckInFieldStats(props.rows, form.value))
  const timeline = computed(() => buildCheckInTimeline(props.rows, form.value))

  const visible = reactive<Record<string, boolean>>({})

  function syncVisibility() {
    const fields = numericFields.value
    for (const field of fields) {
      if (visible[field.id] === undefined) {
        const idx = fields.findIndex((f) => f.id === field.id)
        visible[field.id] = idx >= 0 && idx < props.defaultVisibleCount
      }
    }
  }

  watch(
    () => props.rows,
    () => syncVisibility(),
    { immediate: true, deep: true }
  )

  function fieldColor(fieldId: string) {
    return checkInFieldColor(form.value, fieldId)
  }

  function toggleField(fieldId: string) {
    visible[fieldId] = !visible[fieldId]
  }

  const chartData = computed(() => {
    const labels = timeline.value.map((p) => p.label)
    const datasets = numericFields.value
      .filter((f) => visible[f.id])
      .map((field) => ({
        label: field.shortTitle,
        data: timeline.value.map((p) => {
          const v = p[field.id]
          return typeof v === 'number' ? v : null
        }),
        borderColor: fieldColor(field.id),
        backgroundColor: fieldColor(field.id),
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.25,
        spanGaps: true
      }))
    return { labels, datasets }
  })

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(ctx: { dataset: { label?: string }; parsed: { y: number | null } }) {
            const y = ctx.parsed.y
            if (y === null || y === undefined) return `${ctx.dataset.label}: —`
            return `${ctx.dataset.label}: ${y}`
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 10 },
        grid: { display: false }
      },
      y: {
        min: 1,
        max: 10,
        ticks: { stepSize: 1 },
        grid: { color: 'rgba(148, 163, 184, 0.15)' }
      }
    }
  }
</script>
