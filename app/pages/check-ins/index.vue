<template>
  <UContainer class="py-8 space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">My Check-Ins</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Your weekly self-reports and coach video feedback.
        </p>
      </div>
      <UButton to="/dashboard" color="neutral" variant="ghost" icon="i-lucide-arrow-left">
        Dashboard
      </UButton>
    </div>

    <DashboardWeeklyCheckIn />

    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-semibold text-gray-900 dark:text-white">History (90 days)</h2>
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-lucide-refresh-cw"
            :loading="pending"
            @click="refresh()"
          />
        </div>
      </template>

      <div v-if="pending" class="py-10 text-center text-gray-500">Loading…</div>
      <div v-else-if="!rows.length" class="py-10 text-center text-gray-500">
        No check-ins in the last 90 days yet.
      </div>
      <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
        <div v-for="row in rowsNewestFirst" :key="row.id" class="py-4">
          <button
            type="button"
            class="w-full flex items-center justify-between text-left gap-3"
            @click="toggle(row.id)"
          >
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                Week of {{ formatWeek(row.weekStartDate) }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">
                Submitted {{ formatDate(row.submittedAt) }}
                <span v-if="row.coachVideoUrl"> · Coach video attached</span>
              </p>
            </div>
            <UIcon
              :name="expanded.has(row.id) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
              class="w-4 h-4 text-gray-400"
            />
          </button>

          <div v-if="expanded.has(row.id)" class="mt-4 space-y-4">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div
                v-for="(value, key) in ratingEntries(row.responses)"
                :key="String(key)"
                class="rounded-lg border border-gray-200 dark:border-gray-800 p-3"
              >
                <p class="text-[11px] text-gray-500 truncate">{{ labelFor(String(key), row) }}</p>
                <p class="text-lg font-semibold">{{ value }}</p>
              </div>
            </div>

            <div
              v-for="(value, key) in textEntries(row.responses)"
              :key="`t-${String(key)}`"
              class="text-sm"
            >
              <p class="text-xs text-gray-500 mb-1">{{ labelFor(String(key), row) }}</p>
              <p class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{{ value }}</p>
            </div>

            <div
              v-if="row.coachVideoUrl"
              class="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900"
            >
              <iframe
                :src="embedUrl(row.coachVideoUrl)"
                class="absolute inset-0 w-full h-full border-0"
                allow="fullscreen"
                allowfullscreen
              />
            </div>
            <p
              v-if="row.coachNotes"
              class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
            >
              {{ row.coachNotes }}
            </p>
          </div>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import type { CheckInResponses } from '~~/shared/check-in'
  import { checkInFields, checkInNumericValue } from '~~/shared/check-in'

  definePageMeta({ middleware: 'auth' })

  interface HistoryRow {
    id: string
    weekStartDate: string
    submittedAt: string
    status: string
    responses: CheckInResponses
    coachNotes: string | null
    coachVideoUrl: string | null
    form: {
      sections: { fields: { id: string; label: string; shortTitle: string; type: string }[] }[]
    } | null
  }

  const expanded = ref(new Set<string>())

  const { data, pending, refresh } = await useFetch<{ data: HistoryRow[] }>(
    '/api/check-ins/history',
    {
      query: { days: 90 },
      lazy: true
    }
  )

  const rows = computed(() => data.value?.data ?? [])
  const rowsNewestFirst = computed(() => [...rows.value].reverse())

  function toggle(id: string) {
    const next = new Set(expanded.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    expanded.value = next
  }

  function formatWeek(isoDate: string) {
    return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    })
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    })
  }

  function labelFor(fieldId: string, row: HistoryRow) {
    if (row.form) {
      const field = checkInFields({ sections: row.form.sections as any }).find(
        (f) => f.id === fieldId
      )
      if (field) return field.shortTitle || field.label
    }
    return fieldId.replace(/_/g, ' ')
  }

  function ratingEntries(responses: CheckInResponses) {
    const out: Record<string, number> = {}
    for (const [key, value] of Object.entries(responses)) {
      const n = checkInNumericValue(value)
      if (n !== null) out[key] = n
    }
    return out
  }

  function textEntries(responses: CheckInResponses) {
    const out: Record<string, string> = {}
    for (const [key, value] of Object.entries(responses)) {
      if (typeof value === 'string' && value.trim()) out[key] = value
    }
    return out
  }

  function embedUrl(url: string) {
    if (url.includes('komodo.ai') && url.includes('/recordings/')) {
      return url.replace('/recordings/', '/embed/')
    }
    return url
  }
</script>
