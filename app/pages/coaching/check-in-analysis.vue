<template>
  <div class="flex h-[calc(100vh-4rem)]">
    <aside
      class="flex w-64 shrink-0 flex-col gap-3 overflow-y-auto border-r border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-950/40"
    >
      <CoachingCheckInAthleteGroupSidebar
        v-model="selectedAthleteId"
        :athletes="athletes ?? []"
        :groups="groups ?? []"
        :loading="pendingAthletes || pendingGroups"
      />
    </aside>

    <main class="flex-1 overflow-y-auto bg-white p-4 sm:p-6 dark:bg-gray-950">
      <div
        v-if="!selectedAthleteId"
        class="flex h-full flex-col items-center justify-center text-gray-500"
      >
        <UIcon name="i-lucide-line-chart" class="mb-3 h-14 w-14 opacity-40" />
        <p class="text-lg">Select an athlete to view check-in trends</p>
      </div>

      <div v-else class="max-w-6xl space-y-6">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              The Road of Trials
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Weekly check-in metrics for
              {{ selectedAthleteName }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <USelect
              v-model="datePreset"
              :items="datePresetOptions"
              value-key="value"
              size="sm"
              class="w-40"
            />
            <UButton
              size="sm"
              color="neutral"
              variant="ghost"
              icon="i-lucide-refresh-cw"
              :loading="pendingCheckins"
              @click="refreshCheckins()"
            >
              Refresh
            </UButton>
          </div>
        </div>

        <div v-if="pendingCheckins" class="flex flex-col items-center gap-3 py-16 text-gray-500">
          <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary-500" />
          <p>Loading check-ins…</p>
        </div>

        <div
          v-else-if="!checkIns.length"
          class="rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center text-gray-500 dark:border-gray-700"
        >
          <UIcon name="i-lucide-inbox" class="mx-auto mb-2 h-10 w-10 opacity-50" />
          <p>No weekly check-ins for this athlete yet.</p>
        </div>

        <div
          v-else-if="!filteredCheckIns.length"
          class="rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center text-gray-500 dark:border-gray-700"
        >
          <UIcon name="i-lucide-calendar-x" class="mx-auto mb-2 h-10 w-10 opacity-50" />
          <p>No check-ins in the selected date range.</p>
        </div>

        <template v-else>
          <CoachingCheckInTrendChart :rows="filteredCheckIns" />

          <div class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <div
              class="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800"
            >
              <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
                Recent submissions
              </h2>
              <span class="text-xs text-gray-500">{{ filteredCheckIns.length }}</span>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div
                v-for="row in filteredCheckInsNewestFirst"
                :key="row.id"
                class="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    Week of {{ formatWeek(row.weekStartDate) }}
                  </p>
                  <p class="mt-0.5 text-xs text-gray-500">
                    Submitted {{ formatDate(row.submittedAt) }}
                    <span v-if="row.status === 'REVIEWED'"> · Reviewed</span>
                    <span v-else-if="row.coachVideoUrl"> · Video attached</span>
                  </p>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="stat in previewRatings(row)"
                    :key="stat.id"
                    class="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-[11px] tabular-nums dark:bg-gray-900"
                  >
                    <span class="text-gray-400">{{ stat.label }}</span>
                    <span class="font-semibold text-gray-800 dark:text-gray-100">{{
                      stat.value
                    }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              Reply &amp; video feedback
            </h2>
            <CoachingAthleteCheckIns
              :athlete-id="selectedAthleteId"
              :show-trends="false"
              :date-from="dateRange.from"
              :date-to="dateRange.to"
            />
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import {
    checkInNumericFields,
    checkInNumericValue,
    resolveCheckInFormFromRows,
    type CheckInResponses
  } from '~~/shared/check-in'

  definePageMeta({
    middleware: 'auth'
  })

  interface AthleteRow {
    id: string
    name?: string | null
  }

  interface GroupRow {
    id: string
    name: string
    members?: Array<{ athleteId: string }>
    _count?: { members?: number }
  }

  interface CheckInRow {
    id: string
    weekStartDate: string
    submittedAt: string
    status: string
    responses: CheckInResponses
    coachVideoUrl: string | null
    form: { sections: any[] } | null
  }

  type DatePreset = '4w' | '12w' | '1y' | 'all'

  const route = useRoute()
  const router = useRouter()

  const datePresetOptions = [
    { label: 'Last 4 weeks', value: '4w' },
    { label: 'Last 12 weeks', value: '12w' },
    { label: 'Last year', value: '1y' },
    { label: 'All loaded', value: 'all' }
  ]

  const datePreset = ref<DatePreset>('all')

  watch(datePreset, (value) => {
    if (value && typeof value === 'object' && 'value' in (value as object)) {
      datePreset.value = (value as { value: DatePreset }).value
    }
  })

  const { data: athletes, pending: pendingAthletes } = await useFetch<AthleteRow[]>(
    '/api/coaching/crm/athletes'
  )
  const { data: groups, pending: pendingGroups } =
    await useFetch<GroupRow[]>('/api/coaching/groups')

  const selectedAthleteId = ref<string | null>(
    typeof route.query.athleteId === 'string' ? route.query.athleteId : null
  )

  const {
    data: checkInsData,
    pending: pendingCheckins,
    refresh: refreshCheckins
  } = await useFetch<CheckInRow[]>(
    () =>
      selectedAthleteId.value ? `/api/coaching/athletes/${selectedAthleteId.value}/check-ins` : '',
    {
      immediate: false,
      lazy: true
    }
  )

  const checkIns = computed(() => checkInsData.value ?? [])

  const dateRange = computed(() => {
    if (datePreset.value === 'all')
      return { from: null as string | null, to: null as string | null }
    const weeks = datePreset.value === '4w' ? 4 : datePreset.value === '12w' ? 12 : 52
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - weeks * 7)
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10)
    }
  })

  function rowDateKey(row: { weekStartDate?: string; submittedAt?: string }) {
    const raw = row.weekStartDate || row.submittedAt || ''
    return raw.slice(0, 10)
  }

  const filteredCheckIns = computed(() => {
    const { from, to } = dateRange.value
    if (!from || !to) return checkIns.value
    return checkIns.value.filter((row) => {
      const key = rowDateKey(row)
      return key >= from && key <= to
    })
  })

  const filteredCheckInsNewestFirst = computed(() => filteredCheckIns.value)

  const selectedAthleteName = computed(() => {
    const a = athletes.value?.find((x) => x.id === selectedAthleteId.value)
    return a?.name || 'this athlete'
  })

  watch(selectedAthleteId, (id) => {
    if (id) refreshCheckins()
    const nextQuery = { ...route.query } as Record<string, string | string[] | undefined>
    if (id) nextQuery.athleteId = id
    else delete nextQuery.athleteId
    void router.replace({ query: nextQuery })
  })

  watch(
    () => route.query.athleteId,
    (qid) => {
      const id = typeof qid === 'string' ? qid : null
      if (id !== selectedAthleteId.value) selectedAthleteId.value = id
    }
  )

  if (selectedAthleteId.value) {
    refreshCheckins()
  }

  function formatWeek(isoDate: string) {
    return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  function previewRatings(row: CheckInRow) {
    const form = resolveCheckInFormFromRows([row])
    return checkInNumericFields(form)
      .slice(0, 4)
      .map((field) => ({
        id: field.id,
        label: field.shortTitle,
        value: checkInNumericValue(row.responses[field.id]) ?? '—'
      }))
  }
</script>
