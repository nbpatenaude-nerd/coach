<template>
  <UModal
    v-model:open="isOpen"
    title="Weekly Check-In"
    :description="modalDescription"
    :ui="{ content: 'sm:max-w-4xl' }"
  >
    <template #body>
      <div class="space-y-4">
        <div v-if="pending && !payload" class="animate-pulse space-y-3 py-4">
          <div class="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
          <div class="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded" />
          <div class="h-32 w-full bg-gray-200 dark:bg-gray-800 rounded" />
        </div>

        <div v-else-if="fetchError && !payload" class="space-y-3 py-2">
          <UAlert
            icon="i-lucide-alert-triangle"
            color="error"
            variant="soft"
            title="Couldn’t load check-in"
            description="There was an issue connecting to the server. Please try again."
          />
          <UButton
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-lucide-refresh-cw"
            @click="refreshAll()"
          >
            Retry
          </UButton>
        </div>

        <template v-else>
          <div class="flex flex-wrap items-center gap-2">
            <UBadge
              :color="statusBadge.color"
              variant="subtle"
              size="sm"
              :label="statusBadge.label"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ headerSubtitle }}
            </p>
          </div>

          <UTabs v-model="activeTab" :items="tabItems" class="w-full">
            <template #content="{ item }">
              <!-- Coach Feedback -->
              <div v-if="item.value === 'feedback'" class="pt-4 space-y-4">
                <div v-if="feedbackPending" class="animate-pulse space-y-3">
                  <div class="aspect-video w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
                  <div class="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                </div>

                <div
                  v-else-if="displayFeedback"
                  class="rounded-lg border border-primary-200/70 dark:border-primary-900/50 bg-primary-50/40 dark:bg-primary-950/20 p-3 space-y-3"
                >
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <h4
                      class="text-xs font-semibold flex items-center gap-1.5 text-primary-900 dark:text-primary-100"
                    >
                      <UIcon name="i-lucide-video" class="w-3.5 h-3.5" />
                      Most recent coach feedback
                    </h4>
                    <p
                      v-if="displayFeedback.date"
                      class="text-[11px] text-primary-700/80 dark:text-primary-300/80"
                    >
                      {{ formatDate(displayFeedback.date) }}
                    </p>
                  </div>

                  <div class="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900">
                    <iframe
                      v-if="displayFeedback.videoUrl"
                      :src="embedUrl(displayFeedback.videoUrl)"
                      class="absolute inset-0 w-full h-full border-0"
                      allow="
                        accelerometer;
                        autoplay;
                        clipboard-write;
                        encrypted-media;
                        gyroscope;
                        picture-in-picture;
                        fullscreen;
                        microphone;
                        camera;
                        display-capture;
                      "
                      allowfullscreen
                      loading="lazy"
                    />
                    <div
                      v-else
                      class="absolute inset-0 flex flex-col items-center justify-center text-gray-400"
                    >
                      <UIcon name="i-lucide-video-off" class="w-10 h-10 mb-2 opacity-50" />
                      <span class="text-sm">No video attached</span>
                    </div>
                  </div>

                  <div
                    v-if="displayFeedback.notes"
                    class="text-sm text-primary-900 dark:text-primary-100 whitespace-pre-wrap"
                  >
                    {{ displayFeedback.notes }}
                  </div>
                  <p v-else class="text-xs text-primary-800/70 dark:text-primary-200/70">
                    No written notes with this feedback.
                  </p>
                </div>

                <div
                  v-else
                  class="py-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center"
                >
                  <UIcon name="i-lucide-inbox" class="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p class="text-sm">No coach feedback videos yet.</p>
                  <p class="text-xs mt-1 max-w-sm">
                    After you submit a weekly check-in, your coach’s video reply will show up here.
                  </p>
                </div>
              </div>

              <!-- Complete Check In -->
              <div v-else-if="item.value === 'checkin'" class="pt-4 space-y-4">
                <template v-if="payload?.checkIn && !editing">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Submitted {{ formatDate(payload.checkIn.submittedAt) }}
                      <span v-if="payload.checkIn.status === 'REVIEWED'"> · Reviewed</span>
                    </p>
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-pencil"
                      @click="editing = true"
                    >
                      Edit
                    </UButton>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div
                      v-for="section in payload.form.sections"
                      :key="section.key"
                      class="rounded-lg border border-gray-200/80 dark:border-gray-800 p-3 space-y-2"
                    >
                      <h4
                        class="text-[11px] font-semibold uppercase tracking-wider"
                        :style="{ color: sectionAccent(section.key) }"
                      >
                        {{ section.heading }}
                      </h4>
                      <div class="grid grid-cols-2 gap-1.5">
                        <div
                          v-for="field in section.fields.filter(
                            (f) => f.type === 'rating' || f.type === 'number'
                          )"
                          :key="field.id"
                          class="rounded-md bg-gray-50 dark:bg-gray-900/50 px-2 py-1.5"
                        >
                          <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                            {{ field.shortTitle }}
                          </p>
                          <p
                            class="text-sm font-semibold tabular-nums text-gray-900 dark:text-white"
                          >
                            {{ displayValue(payload.checkIn!.responses[field.id]) }}
                          </p>
                        </div>
                      </div>
                      <div
                        v-for="field in section.fields.filter(
                          (f) => f.type !== 'rating' && f.type !== 'number'
                        )"
                        :key="field.id"
                        class="text-xs text-gray-600 dark:text-gray-300"
                      >
                        <span
                          class="text-[10px] uppercase tracking-wide text-gray-400 block mb-0.5"
                        >
                          {{ field.shortTitle }}
                        </span>
                        <p class="line-clamp-3 whitespace-pre-wrap">
                          {{ displayValue(payload.checkIn!.responses[field.id]) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </template>

                <template v-else-if="payload">
                  <p v-if="!payload.checkIn" class="text-xs text-gray-500 dark:text-gray-400">
                    {{
                      payload.form.description ||
                      'Tell your coach how the week landed — due before Wednesday morning.'
                    }}
                  </p>
                  <CheckInFormFields
                    :sections="payload.form.sections"
                    :model-value="editState"
                    :submitting="submitting"
                    :submit-label="payload.checkIn ? 'Update Check-In' : 'Submit Check-In'"
                    :show-cancel="!!payload.checkIn"
                    @update:model-value="(v) => Object.assign(editState, v)"
                    @submit="submitCheckIn"
                    @cancel="editing = false"
                  />
                </template>
              </div>

              <!-- History -->
              <div v-else-if="item.value === 'history'" class="pt-4">
                <CheckInHistoryPanel ref="historyPanelRef" />
              </div>
            </template>
          </UTabs>
        </template>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import type {
    CheckInFormDefinition,
    CheckInResponses,
    CheckInSectionKey
  } from '~~/shared/check-in'
  import { CHECK_IN_SECTION_COLORS, coachVideoEmbedUrl } from '~~/shared/check-in'
  import CheckInFormFields from '~/components/check-in/CheckInFormFields.vue'
  import CheckInHistoryPanel from '~/components/check-in/CheckInHistoryPanel.vue'

  interface CurrentPayload {
    weekStartDate: string
    timezone: string
    deadline: string
    isPromptWindow: boolean
    isPastDeadline: boolean
    needsAction: boolean
    form: {
      id: string | null
      slug: string
      title: string
      description: string | null
      version: number
      sections: CheckInFormDefinition['sections']
    }
    checkIn: {
      id: string
      responses: CheckInResponses
      submittedAt: string
      updatedAt: string
      status: string
      coachNotes: string | null
      coachVideoUrl: string | null
      coachVideoAddedAt: string | null
      coachReviewedAt: string | null
    } | null
    lastCompleted: {
      id: string
      submittedAt: string
      weekStartDate: string
      status: string
    } | null
    latestCoachFeedback: {
      id: string
      weekStartDate: string
      submittedAt: string
      coachNotes: string | null
      coachVideoUrl: string | null
      coachVideoAddedAt: string | null
      coachReviewedAt: string | null
    } | null
  }

  interface FeedbackRow {
    id: string
    createdAt: string
    komodoUrl?: string | null
    coachNotes?: string | null
  }

  type TabValue = 'feedback' | 'checkin' | 'history'

  const props = defineProps<{
    open: boolean
  }>()

  const emit = defineEmits<{ 'update:open': [value: boolean] }>()

  const isOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value)
  })

  const toast = useToast()
  const editing = ref(false)
  const submitting = ref(false)
  const editState = reactive<Record<string, string | number>>({})
  const activeTab = ref<TabValue>('checkin')
  const historyPanelRef = ref<{ refresh: () => Promise<unknown> } | null>(null)

  const {
    data: payload,
    pending,
    error: fetchError,
    refresh
  } = await useFetch<CurrentPayload>('/api/check-ins/current', {
    lazy: true,
    immediate: false
  })

  const {
    data: feedbackResponse,
    pending: feedbackPending,
    refresh: refreshFeedback
  } = await useFetch<{ data: FeedbackRow[] }>('/api/feedback', {
    lazy: true,
    immediate: false
  })

  const tabItems = computed(() => [
    { label: 'Coach Feedback', value: 'feedback', icon: 'i-lucide-video' },
    { label: 'Complete Check In', value: 'checkin', icon: 'i-lucide-clipboard-check' },
    { label: 'History', value: 'history', icon: 'i-lucide-line-chart' }
  ])

  const latestApiFeedback = computed(() => feedbackResponse.value?.data?.[0] ?? null)

  const displayFeedback = computed(() => {
    const fromApi = latestApiFeedback.value
    if (fromApi && (fromApi.komodoUrl || fromApi.coachNotes)) {
      return {
        videoUrl: fromApi.komodoUrl || null,
        notes: fromApi.coachNotes || null,
        date: fromApi.createdAt
      }
    }

    const fromCheckIn =
      payload.value?.checkIn?.coachVideoUrl || payload.value?.checkIn?.coachNotes
        ? payload.value.checkIn
        : payload.value?.latestCoachFeedback

    if (!fromCheckIn) return null
    if (!fromCheckIn.coachVideoUrl && !fromCheckIn.coachNotes) return null

    return {
      videoUrl: fromCheckIn.coachVideoUrl,
      notes: fromCheckIn.coachNotes,
      date:
        fromCheckIn.coachVideoAddedAt ||
        fromCheckIn.coachReviewedAt ||
        ('submittedAt' in fromCheckIn ? fromCheckIn.submittedAt : null)
    }
  })

  async function refreshAll() {
    await Promise.all([refresh(), refreshFeedback()])
    hydrateFromCheckIn()
    if (activeTab.value === 'history') {
      await historyPanelRef.value?.refresh?.()
    }
  }

  watch(
    isOpen,
    async (open) => {
      if (!open) return
      await refreshAll()
      editing.value = !payload.value?.checkIn

      if (payload.value?.needsAction && !payload.value.checkIn) {
        activeTab.value = 'checkin'
      } else if (displayFeedback.value?.videoUrl || displayFeedback.value?.notes) {
        activeTab.value = 'feedback'
      } else {
        activeTab.value = 'checkin'
      }
    },
    { immediate: true }
  )

  watch(activeTab, async (tab) => {
    if (tab === 'history') {
      await historyPanelRef.value?.refresh?.()
    }
  })

  const modalDescription = computed(() => {
    const p = payload.value
    if (!p) return 'Coach feedback, weekly check-in, and your history in one place.'
    if (p.needsAction && !p.checkIn) {
      return p.isPastDeadline
        ? 'Past the usual Wednesday deadline — still submit if you can.'
        : 'Mon–Tue window · due before Wednesday morning.'
    }
    if (p.checkIn) return `Week of ${formatWeek(p.weekStartDate)}`
    return 'Coach feedback, weekly check-in, and your history in one place.'
  })

  const statusBadge = computed(() => {
    const p = payload.value
    if (!p) return { color: 'neutral' as const, label: '…' }
    if (p.checkIn?.status === 'REVIEWED' || p.checkIn?.coachVideoUrl || displayFeedback.value) {
      return { color: 'success' as const, label: 'Feedback ready' }
    }
    if (p.checkIn) return { color: 'success' as const, label: 'Submitted' }
    if (p.needsAction && p.isPastDeadline) return { color: 'error' as const, label: 'Overdue' }
    if (p.needsAction) return { color: 'warning' as const, label: 'Due soon' }
    return { color: 'neutral' as const, label: 'Up to date' }
  })

  const headerSubtitle = computed(() => {
    const p = payload.value
    if (!p) return ''
    if (p.needsAction && !p.checkIn) {
      return p.isPastDeadline
        ? 'Past the usual Wednesday deadline — still submit if you can'
        : 'Mon–Tue window · due before Wednesday morning'
    }
    if (p.checkIn) {
      return `This week · ${formatDate(p.checkIn.submittedAt)}`
    }
    if (p.lastCompleted) {
      return `Last completed · ${formatDate(p.lastCompleted.submittedAt)}`
    }
    return 'No check-ins yet'
  })

  function blankState(sections: CheckInFormDefinition['sections']) {
    const next: Record<string, string | number> = {}
    for (const section of sections) {
      for (const field of section.fields) {
        if (field.type === 'rating' || field.type === 'number') {
          next[field.id] = field.min ?? 5
        } else {
          next[field.id] = ''
        }
      }
    }
    return next
  }

  function hydrateFromCheckIn() {
    if (!payload.value) return
    const base = blankState(payload.value.form.sections)
    const existing = payload.value.checkIn?.responses ?? {}
    for (const key of Object.keys(base)) {
      const v = existing[key]
      if (v !== null && v !== undefined && v !== '') {
        base[key] = v as string | number
      }
    }
    for (const k of Object.keys(editState)) {
      if (!(k in base)) {
        Reflect.deleteProperty(editState, k)
      }
    }
    Object.assign(editState, base)
  }

  function sectionAccent(key: CheckInSectionKey) {
    return CHECK_IN_SECTION_COLORS[key]?.[0] ?? '#00A8FF'
  }

  function displayValue(value: unknown) {
    if (value === null || value === undefined || value === '') return '—'
    return String(value)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  function formatWeek(isoDate: string) {
    return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function embedUrl(url: string) {
    return coachVideoEmbedUrl(url)
  }

  async function submitCheckIn() {
    submitting.value = true
    try {
      await $fetch('/api/check-ins', {
        method: 'POST',
        body: { responses: { ...editState } }
      })
      toast.add({
        title: editing.value && payload.value?.checkIn ? 'Check-in updated' : 'Check-in submitted',
        description: 'Your coach will review this before Wednesday.',
        icon: 'i-lucide-check-circle',
        color: 'success'
      })
      editing.value = false
      await refresh()
      hydrateFromCheckIn()
      await historyPanelRef.value?.refresh?.()
    } catch (err: any) {
      toast.add({
        title: 'Couldn’t submit check-in',
        description: err?.data?.message || err?.message || 'Please try again.',
        icon: 'i-lucide-alert-circle',
        color: 'error'
      })
    } finally {
      submitting.value = false
    }
  }
</script>
