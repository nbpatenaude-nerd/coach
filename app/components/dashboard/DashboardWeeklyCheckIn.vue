<template>
  <UCard class="mb-6 h-full flex flex-col" :ui="{ body: 'p-4 sm:p-6' }">
    <div v-if="pending" class="animate-pulse space-y-4">
      <div class="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
      <div class="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded" />
      <div class="h-40 w-full bg-gray-200 dark:bg-gray-800 rounded" />
    </div>

    <div v-else-if="fetchError" class="space-y-4 py-6">
      <UAlert
        icon="i-lucide-alert-triangle"
        color="error"
        variant="soft"
        title="Couldn’t load check-in"
        description="There was an issue connecting to the server. Please try again."
      />
      <UButton color="neutral" variant="soft" icon="i-lucide-refresh-cw" @click="refresh()">
        Retry
      </UButton>
    </div>

    <!-- Submitted this week -->
    <div v-else-if="payload?.checkIn" class="space-y-5">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-green-500 shrink-0" />
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              Weekly Check-In Complete
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Submitted {{ formatDate(payload.checkIn.submittedAt) }}
              <span v-if="payload.isPastDeadline"> · Coach review window open</span>
            </p>
          </div>
        </div>
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

      <div v-if="!editing" class="space-y-4">
        <div v-for="section in payload.form.sections" :key="section.key" class="space-y-2">
          <h4
            class="text-xs font-semibold uppercase tracking-wider"
            :style="{ color: sectionAccent(section.key) }"
          >
            {{ section.heading }}
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div
              v-for="field in section.fields"
              :key="field.id"
              class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 p-3"
            >
              <p class="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {{ field.shortTitle }}
              </p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white mt-0.5">
                {{ displayValue(payload.checkIn!.responses[field.id]) }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="payload.checkIn.coachVideoUrl || payload.checkIn.coachNotes"
          class="rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50/60 dark:bg-primary-950/30 p-4 space-y-3"
        >
          <h4 class="font-semibold flex items-center gap-2 text-primary-900 dark:text-primary-100">
            <UIcon name="i-lucide-video" class="w-5 h-5" />
            Coach Feedback
          </h4>
          <div
            v-if="payload.checkIn.coachVideoUrl"
            class="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900"
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
            class="text-sm text-primary-800 dark:text-primary-200 whitespace-pre-wrap"
          >
            {{ payload.checkIn.coachNotes }}
          </p>
        </div>
        <p v-else class="text-sm text-gray-600 dark:text-gray-400">
          You’re all set for this week. Your coach will review your responses
          <span v-if="!payload.isPastDeadline"> before Wednesday morning</span>.
        </p>
      </div>

      <CheckInFormFields
        v-else
        :sections="payload.form.sections"
        :model-value="editState"
        :submitting="submitting"
        submit-label="Update Check-In"
        show-cancel
        @update:model-value="(v) => Object.assign(editState, v)"
        @submit="submitCheckIn"
        @cancel="editing = false"
      />
    </div>

    <!-- Not submitted yet -->
    <div v-else-if="payload" class="space-y-5">
      <div class="text-center sm:text-left">
        <div class="flex items-center justify-center sm:justify-start gap-2 mb-2">
          <UIcon name="i-lucide-clipboard-check" class="w-7 h-7 text-primary-500" />
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ payload.form.title }}</h3>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
          {{
            payload.form.description ||
            'Tell your coach how the week landed — due before Wednesday morning.'
          }}
        </p>
        <UBadge
          v-if="payload.isPromptWindow"
          color="warning"
          variant="subtle"
          class="mt-3"
          label="Due before Wednesday morning"
        />
        <UBadge
          v-else-if="payload.isPastDeadline && !payload.checkIn"
          color="error"
          variant="subtle"
          class="mt-3"
          label="Past the usual deadline — still submit if you can"
        />
      </div>

      <CheckInFormFields
        :sections="payload.form.sections"
        :model-value="editState"
        :submitting="submitting"
        submit-label="Submit Check-In"
        @update:model-value="(v) => Object.assign(editState, v)"
        @submit="submitCheckIn"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue'
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
  }

  const toast = useToast()
  const editing = ref(false)
  const submitting = ref(false)
  const editState = reactive<Record<string, string | number>>({})

  const {
    data: payload,
    pending,
    error: fetchError,
    refresh
  } = await useFetch<CurrentPayload>('/api/check-ins/current', { lazy: true })

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

  watch(
    () => payload.value,
    () => {
      hydrateFromCheckIn()
      editing.value = false
    },
    { immediate: true }
  )

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
