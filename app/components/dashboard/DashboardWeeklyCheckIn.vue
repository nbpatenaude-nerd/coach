<template>
  <div
    class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
  >
    <!-- Loading -->
    <div v-if="pending" class="p-4 animate-pulse space-y-3">
      <div class="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
      <div class="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded" />
    </div>

    <!-- Error -->
    <div v-else-if="fetchError" class="p-4 space-y-3">
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
        @click="refresh()"
      >
        Retry
      </UButton>
    </div>

    <template v-else-if="payload">
      <!-- Compact header — always visible -->
      <button
        type="button"
        class="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50/80 dark:hover:bg-gray-900/50 transition-colors"
        :aria-expanded="expanded"
        @click="toggleExpanded"
      >
        <div
          class="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
          :class="headerIconClass"
        >
          <UIcon :name="headerIcon" class="w-4 h-4" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              Weekly Check-In
            </h3>
            <UBadge
              :color="statusBadge.color"
              variant="subtle"
              size="sm"
              :label="statusBadge.label"
            />
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {{ headerSubtitle }}
          </p>
        </div>

        <UIcon
          name="i-lucide-chevron-down"
          class="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200"
          :class="{ 'rotate-180': expanded }"
        />
      </button>

      <!-- Collapsed summary: last video + last completed -->
      <div v-if="!expanded" class="px-4 pb-4 pt-0 border-t border-transparent">
        <div
          v-if="summaryVideoUrl || summaryNotes"
          class="mt-1 grid grid-cols-1 sm:grid-cols-[minmax(0,16rem)_1fr] gap-3 items-start"
        >
          <div
            v-if="summaryVideoUrl"
            class="relative w-full aspect-video max-h-36 rounded-lg overflow-hidden bg-gray-900"
            @click.stop
          >
            <iframe
              :src="embedUrl(summaryVideoUrl)"
              class="absolute inset-0 w-full h-full border-0"
              allow="
                accelerometer;
                autoplay;
                clipboard-write;
                encrypted-media;
                gyroscope;
                picture-in-picture;
                fullscreen;
              "
              allowfullscreen
              loading="lazy"
            />
          </div>
          <div class="space-y-1.5 min-w-0">
            <p v-if="payload.lastCompleted" class="text-xs text-gray-600 dark:text-gray-300">
              <span class="text-gray-400 dark:text-gray-500">Last completed</span>
              · {{ formatDate(payload.lastCompleted.submittedAt) }}
            </p>
            <p
              v-if="summaryNotes"
              class="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 whitespace-pre-wrap"
            >
              {{ summaryNotes }}
            </p>
            <p v-else-if="summaryVideoUrl" class="text-xs text-gray-500 dark:text-gray-400">
              Latest coach response video
              <span v-if="payload.latestCoachFeedback?.coachVideoAddedAt">
                · {{ formatDate(payload.latestCoachFeedback.coachVideoAddedAt) }}
              </span>
            </p>
            <UButton
              v-if="payload.needsAction"
              size="xs"
              color="primary"
              variant="soft"
              icon="i-lucide-clipboard-pen"
              @click.stop="expanded = true"
            >
              Fill out check-in
            </UButton>
          </div>
        </div>

        <div v-else class="mt-1 flex flex-wrap items-center justify-between gap-2">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            <template v-if="payload.lastCompleted">
              Last completed · {{ formatDate(payload.lastCompleted.submittedAt) }}
            </template>
            <template v-else>No check-ins yet</template>
          </p>
          <UButton
            v-if="payload.needsAction"
            size="xs"
            color="primary"
            variant="soft"
            icon="i-lucide-clipboard-pen"
            @click.stop="expanded = true"
          >
            Fill out check-in
          </UButton>
          <UButton
            v-else-if="payload.checkIn"
            size="xs"
            color="neutral"
            variant="ghost"
            @click.stop="expanded = true"
          >
            View responses
          </UButton>
        </div>
      </div>

      <!-- Expanded body -->
      <div
        v-show="expanded"
        class="px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 space-y-4"
      >
        <!-- This week submitted -->
        <template v-if="payload.checkIn && !editing">
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
                  <p class="text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
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
                <span class="text-[10px] uppercase tracking-wide text-gray-400 block mb-0.5">
                  {{ field.shortTitle }}
                </span>
                <p class="line-clamp-3 whitespace-pre-wrap">
                  {{ displayValue(payload.checkIn!.responses[field.id]) }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="payload.checkIn.coachVideoUrl || payload.checkIn.coachNotes"
            class="rounded-lg border border-primary-200/70 dark:border-primary-900/50 bg-primary-50/40 dark:bg-primary-950/20 p-3 space-y-2"
          >
            <h4
              class="text-xs font-semibold flex items-center gap-1.5 text-primary-900 dark:text-primary-100"
            >
              <UIcon name="i-lucide-video" class="w-3.5 h-3.5" />
              Coach feedback this week
            </h4>
            <div
              v-if="payload.checkIn.coachVideoUrl"
              class="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-gray-900"
            >
              <iframe
                :src="embedUrl(payload.checkIn.coachVideoUrl)"
                class="absolute inset-0 w-full h-full border-0"
                allow="
                  accelerometer;
                  autoplay;
                  clipboard-write;
                  encrypted-media;
                  gyroscope;
                  picture-in-picture;
                  fullscreen;
                "
                allowfullscreen
              />
            </div>
            <p
              v-if="payload.checkIn.coachNotes"
              class="text-xs text-primary-800 dark:text-primary-200 whitespace-pre-wrap"
            >
              {{ payload.checkIn.coachNotes }}
            </p>
          </div>
          <p v-else class="text-xs text-gray-500 dark:text-gray-400">
            You’re set for this week. Your coach will review before Wednesday morning.
          </p>
        </template>

        <!-- Edit / first submit form -->
        <template v-else>
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
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import type {
    CheckInFormDefinition,
    CheckInResponses,
    CheckInSectionKey
  } from '~~/shared/check-in'
  import { CHECK_IN_SECTION_COLORS } from '~~/shared/check-in'
  import CheckInFormFields from '~/components/check-in/CheckInFormFields.vue'

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

  const toast = useToast()
  const editing = ref(false)
  const submitting = ref(false)
  const expanded = ref(false)
  const editState = reactive<Record<string, string | number>>({})
  const userToggled = ref(false)

  const {
    data: payload,
    pending,
    error: fetchError,
    refresh
  } = await useFetch<CurrentPayload>('/api/check-ins/current', { lazy: true })

  // Auto-expand when action is needed; otherwise stay collapsed unless user opened it.
  watch(
    () => payload.value,
    (p) => {
      hydrateFromCheckIn()
      editing.value = false
      if (!userToggled.value) {
        expanded.value = !!p?.needsAction
      }
    },
    { immediate: true }
  )

  function toggleExpanded() {
    userToggled.value = true
    expanded.value = !expanded.value
  }

  const statusBadge = computed(() => {
    const p = payload.value
    if (!p) return { color: 'neutral' as const, label: '…' }
    if (p.checkIn?.status === 'REVIEWED' || p.checkIn?.coachVideoUrl) {
      return { color: 'success' as const, label: 'Feedback ready' }
    }
    if (p.checkIn) return { color: 'success' as const, label: 'Submitted' }
    if (p.needsAction && p.isPastDeadline) return { color: 'error' as const, label: 'Overdue' }
    if (p.needsAction) return { color: 'warning' as const, label: 'Due soon' }
    return { color: 'neutral' as const, label: 'Up to date' }
  })

  const headerIcon = computed(() => {
    if (payload.value?.checkIn) return 'i-lucide-check-circle'
    if (payload.value?.needsAction) return 'i-lucide-clipboard-pen'
    return 'i-lucide-clipboard-check'
  })

  const headerIconClass = computed(() => {
    if (payload.value?.checkIn)
      return 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400'
    if (payload.value?.needsAction)
      return 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
    return 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400'
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

  /** Prefer this week's coach video; fall back to most recent feedback. */
  const summaryVideoUrl = computed(() => {
    return (
      payload.value?.checkIn?.coachVideoUrl ||
      payload.value?.latestCoachFeedback?.coachVideoUrl ||
      null
    )
  })

  const summaryNotes = computed(() => {
    if (payload.value?.checkIn?.coachNotes) return payload.value.checkIn.coachNotes
    if (!payload.value?.checkIn) return payload.value?.latestCoachFeedback?.coachNotes ?? null
    return null
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

  function embedUrl(url: string) {
    if (!url) return ''
    if (url.includes('komodo.ai')) {
      if (url.includes('/embed/')) return url
      return url.replace('/recordings/', '/embed/')
    }
    if (url.includes('video.trinerds.com')) return url
    return url
  }

  async function submitCheckIn() {
    submitting.value = true
    try {
      await $fetch('/api/check-ins', {
        method: 'POST',
        body: { responses: { ...editState } }
      })
      toast.add({
        title: editing.value ? 'Check-in updated' : 'Check-in submitted',
        description: 'Your coach will review this before Wednesday.',
        icon: 'i-lucide-check-circle',
        color: 'success'
      })
      editing.value = false
      userToggled.value = false
      await refresh()
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
