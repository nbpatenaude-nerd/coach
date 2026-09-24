<template>
  <div class="flex h-[calc(100vh-4rem)]">
    <aside
      class="w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 p-4 flex flex-col gap-3 overflow-y-auto"
    >
      <h2 class="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-xs">
        Select Athlete
      </h2>
      <div v-if="pendingAthletes" class="text-sm text-gray-500 text-center py-6">Loading…</div>
      <div v-else-if="!athletes?.length" class="text-sm text-gray-500">No athletes found.</div>
      <div v-else class="flex flex-col gap-1">
        <button
          v-for="athlete in athletes"
          :key="athlete.id"
          type="button"
          class="flex items-center gap-3 w-full text-left p-2 rounded-lg transition-colors border"
          :class="
            selectedAthleteId === athlete.id
              ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-300 dark:border-primary-800 text-primary-700 dark:text-primary-200'
              : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200'
          "
          @click="selectedAthleteId = athlete.id"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
            :class="
              selectedAthleteId === athlete.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            "
          >
            {{ athlete.name ? athlete.name.charAt(0).toUpperCase() : 'U' }}
          </div>
          <span class="text-sm font-medium truncate">{{ athlete.name || 'Unnamed' }}</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-gray-950">
      <div
        v-if="!selectedAthleteId"
        class="h-full flex flex-col items-center justify-center text-gray-500"
      >
        <UIcon name="i-lucide-line-chart" class="w-14 h-14 mb-3 opacity-40" />
        <p class="text-lg">Select an athlete to view check-in trends</p>
      </div>

      <div v-else class="space-y-6 max-w-6xl">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              The Road of Trials
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Weekly check-in metrics for
              {{ selectedAthleteName }}
            </p>
          </div>
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

        <div v-if="pendingCheckins" class="py-16 flex flex-col items-center text-gray-500 gap-3">
          <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
          <p>Loading check-ins…</p>
        </div>

        <div
          v-else-if="!checkIns.length"
          class="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 px-6 py-12 text-center text-gray-500"
        >
          <UIcon name="i-lucide-inbox" class="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No weekly check-ins for this athlete yet.</p>
        </div>

        <template v-else>
          <CoachingCheckInTrendChart :rows="checkIns" />

          <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div
              class="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between"
            >
              <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
                Recent submissions
              </h2>
              <span class="text-xs text-gray-500">{{ checkIns.length }}</span>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div
                v-for="row in checkInsNewestFirst"
                :key="row.id"
                class="px-4 py-3 flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    Week of {{ formatWeek(row.weekStartDate) }}
                  </p>
                  <p class="text-xs text-gray-500 mt-0.5">
                    Submitted {{ formatDate(row.submittedAt) }}
                    <span v-if="row.status === 'REVIEWED'"> · Reviewed</span>
                    <span v-else-if="row.coachVideoUrl"> · Video attached</span>
                  </p>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="stat in previewRatings(row)"
                    :key="stat.id"
                    class="inline-flex items-center gap-1 rounded-md bg-gray-50 dark:bg-gray-900 px-2 py-1 text-[11px] tabular-nums"
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
            <h2 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Reply &amp; video feedback
            </h2>
            <CoachingAthleteCheckIns :athlete-id="selectedAthleteId" :show-trends="false" />
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

  interface CheckInRow {
    id: string
    weekStartDate: string
    submittedAt: string
    status: string
    responses: CheckInResponses
    coachVideoUrl: string | null
    form: { sections: any[] } | null
  }

  const { data: athletes, pending: pendingAthletes } = await useFetch<AthleteRow[]>(
    '/api/coaching/crm/athletes'
  )
  const selectedAthleteId = ref<string | null>(null)

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
  const checkInsNewestFirst = computed(() => checkIns.value)

  const selectedAthleteName = computed(() => {
    const a = athletes.value?.find((x) => x.id === selectedAthleteId.value)
    return a?.name || 'this athlete'
  })

  watch(selectedAthleteId, (id) => {
    if (id) refreshCheckins()
  })

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
