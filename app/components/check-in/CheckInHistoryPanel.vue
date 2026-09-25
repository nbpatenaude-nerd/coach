<template>
  <div class="space-y-4">
    <div v-if="pending" class="animate-pulse space-y-3 py-2">
      <div class="h-40 w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
      <div class="h-24 w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
    </div>

    <div v-else-if="fetchError" class="space-y-3">
      <UAlert
        icon="i-lucide-alert-triangle"
        color="error"
        variant="soft"
        title="Couldn’t load history"
        description="There was an issue loading your check-in history."
      />
      <UButton
        color="neutral"
        variant="soft"
        size="sm"
        icon="i-lucide-refresh-cw"
        @click="refresh()"
      >
        Retry
      </UButton>
    </div>

    <div v-else-if="rows.length === 0" class="py-10 text-center text-gray-500 dark:text-gray-400">
      <UIcon name="i-lucide-clipboard-list" class="w-10 h-10 mx-auto mb-2 opacity-50" />
      <p class="text-sm">
        No check-ins yet. Complete your first weekly check-in to start a history.
      </p>
    </div>

    <template v-else>
      <CoachingCheckInTrendChart
        :rows="rows"
        title="Your check-in trends"
        subtitle="Ratings across weekly submissions"
        :default-visible-count="4"
      />

      <div
        class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 sm:p-4 space-y-3"
      >
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Compare check-ins</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Pick up to two weeks to compare side by side.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UFormField label="Check-in A">
            <USelect
              v-model="compareA"
              :items="selectItems"
              placeholder="Select a week"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Check-in B (optional)">
            <USelect
              v-model="compareB"
              :items="selectItemsB"
              placeholder="Select a second week"
              class="w-full"
            />
          </UFormField>
        </div>

        <div v-if="selectedRows.length" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th class="py-2 pr-3 font-semibold">Metric</th>
                <th
                  v-for="row in selectedRows"
                  :key="row.id"
                  class="py-2 px-2 font-semibold whitespace-nowrap"
                >
                  {{ formatWeek(row.weekStartDate) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="field in compareFields"
                :key="field.id"
                class="border-t border-gray-100 dark:border-gray-800/80"
              >
                <td class="py-2 pr-3 text-xs text-gray-600 dark:text-gray-300">
                  {{ field.shortTitle }}
                </td>
                <td
                  v-for="row in selectedRows"
                  :key="`${row.id}-${field.id}`"
                  class="py-2 px-2 font-semibold tabular-nums text-gray-900 dark:text-white"
                  :class="diffClass(field.id, row)"
                >
                  {{ displayValue(row.responses[field.id]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch, onMounted } from 'vue'
  import type { CheckInChartRow, CheckInFormDefinition } from '~~/shared/check-in'
  import { checkInNumericFields, resolveCheckInFormFromRows } from '~~/shared/check-in'

  type HistoryRow = CheckInChartRow & {
    id: string
    status?: string
    coachNotes?: string | null
    coachVideoUrl?: string | null
  }

  const {
    data: historyPayload,
    pending,
    error: fetchError,
    refresh
  } = useFetch<{ data: HistoryRow[] }>('/api/check-ins/history', {
    query: { days: 365, limit: 52 },
    lazy: true,
    immediate: false
  })

  defineExpose({ refresh })

  const rows = computed(() => historyPayload.value?.data ?? [])
  const compareA = ref<string | undefined>()
  const compareB = ref<string | undefined>()

  const selectItems = computed(() =>
    [...rows.value]
      .slice()
      .reverse()
      .map((row) => ({
        label: formatWeek(row.weekStartDate),
        value: row.id
      }))
  )

  const selectItemsB = computed(() =>
    selectItems.value.filter((item) => item.value !== compareA.value)
  )

  const form = computed<CheckInFormDefinition>(() => resolveCheckInFormFromRows(rows.value))
  const compareFields = computed(() => checkInNumericFields(form.value))

  const selectedRows = computed(() => {
    const byId = new Map(rows.value.map((r) => [r.id, r]))
    const picked: HistoryRow[] = []
    if (compareA.value && byId.has(compareA.value)) picked.push(byId.get(compareA.value)!)
    if (compareB.value && byId.has(compareB.value) && compareB.value !== compareA.value) {
      picked.push(byId.get(compareB.value)!)
    }
    return picked
  })

  watch(
    rows,
    (list) => {
      if (!list.length) return
      const newest = [...list].reverse()
      if (!compareA.value) compareA.value = newest[0]?.id
      if (!compareB.value && newest[1]) compareB.value = newest[1].id
    },
    { immediate: true }
  )

  watch(compareA, (a) => {
    if (a && a === compareB.value) compareB.value = undefined
  })

  function formatWeek(isoDate: string) {
    return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function displayValue(value: unknown) {
    if (value === null || value === undefined || value === '') return '—'
    return String(value)
  }

  function diffClass(fieldId: string, row: HistoryRow) {
    if (selectedRows.value.length !== 2) return ''
    const [a, b] = selectedRows.value
    const av = Number(a?.responses[fieldId])
    const bv = Number(b?.responses[fieldId])
    if (!Number.isFinite(av) || !Number.isFinite(bv) || av === bv) return ''
    const isA = row.id === a?.id
    const higher = isA ? av > bv : bv > av
    return higher ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
  }

  // Load when the History tab mounts this panel.
  onMounted(() => {
    void refresh()
  })
</script>
