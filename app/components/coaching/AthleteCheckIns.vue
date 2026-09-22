<template>
  <div class="space-y-4">
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 3" :key="i" class="h-28 w-full rounded-xl" />
    </div>

    <div v-else-if="error">
      <UAlert color="error" variant="soft" title="Failed to load check-ins" :description="error" />
      <UButton class="mt-3" size="sm" color="neutral" variant="soft" @click="fetchCheckIns">
        Retry
      </UButton>
    </div>

    <div v-else-if="checkIns.length === 0">
      <div
        class="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 px-6 py-10 text-center"
      >
        <UIcon name="i-lucide-clipboard-list" class="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p class="text-sm text-gray-500 dark:text-gray-400">No weekly check-ins submitted yet.</p>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="checkIn in checkIns"
        :key="checkIn.id"
        class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
      >
        <button
          type="button"
          class="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50/80 dark:hover:bg-gray-900/40 transition-colors"
          @click="toggle(checkIn.id)"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                Week of {{ formatWeek(checkIn.weekStartDate) }}
              </h3>
              <UBadge
                :color="checkIn.status === 'REVIEWED' ? 'success' : 'warning'"
                variant="subtle"
                size="sm"
                :label="checkIn.status === 'REVIEWED' ? 'Reviewed' : 'Needs reply'"
              />
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Submitted {{ formatDate(checkIn.submittedAt) }}
              <span v-if="checkIn.coachVideoUrl"> · Video attached</span>
            </p>
          </div>
          <UIcon
            name="i-lucide-chevron-down"
            class="w-4 h-4 text-gray-400 shrink-0 transition-transform"
            :class="{ 'rotate-180': expanded.has(checkIn.id) }"
          />
        </button>

        <div
          v-if="expanded.has(checkIn.id)"
          class="px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 space-y-4"
        >
          <!-- Responses -->
          <div v-if="checkIn.form?.sections?.length" class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              v-for="section in checkIn.form.sections"
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
                  v-for="field in ratingFields(section)"
                  :key="field.id"
                  class="rounded-md bg-gray-50 dark:bg-gray-900/50 px-2 py-1.5"
                >
                  <p class="text-[10px] text-gray-500 truncate">{{ field.shortTitle }}</p>
                  <p class="text-sm font-semibold tabular-nums">
                    {{ displayValue(checkIn.responses[field.id]) }}
                  </p>
                </div>
              </div>
              <div v-for="field in textFields(section)" :key="field.id" class="text-xs">
                <p class="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">
                  {{ field.shortTitle }}
                </p>
                <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-4">
                  {{ displayValue(checkIn.responses[field.id]) }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="text-xs text-gray-500">
            Responses on file, but no form definition is attached to this check-in.
          </div>

          <!-- Existing coach reply -->
          <div
            v-if="checkIn.coachReviewedAt && !editing[checkIn.id]"
            class="rounded-lg border border-primary-200/70 dark:border-primary-900/50 bg-primary-50/40 dark:bg-primary-950/20 p-3 space-y-2"
          >
            <div class="flex items-center justify-between gap-2">
              <p
                class="text-xs font-semibold flex items-center gap-1.5 text-primary-900 dark:text-primary-100"
              >
                <UIcon name="i-lucide-video" class="w-3.5 h-3.5" />
                Your reply
                <span class="font-normal text-primary-700/70 dark:text-primary-300/70">
                  · {{ formatDate(checkIn.coachReviewedAt) }}
                </span>
              </p>
              <UButton size="xs" color="primary" variant="ghost" @click="startEdit(checkIn)">
                Edit
              </UButton>
            </div>
            <div
              v-if="checkIn.coachVideoUrl"
              class="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-gray-900"
            >
              <iframe
                :src="embedUrl(checkIn.coachVideoUrl)"
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
              v-if="checkIn.coachNotes"
              class="text-sm text-primary-900 dark:text-primary-100 whitespace-pre-wrap"
            >
              {{ checkIn.coachNotes }}
            </p>
          </div>

          <!-- Reply form -->
          <div v-else class="space-y-3 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ checkIn.coachReviewedAt ? 'Update reply' : 'Reply to check-in' }}
            </p>
            <UFormField
              label="Coach video URL"
              hint="komodo.ai or video.trinerds.com"
              name="videoUrl"
            >
              <UInput
                v-model="replyDrafts[checkIn.id].videoUrl"
                placeholder="https://komodo.ai/embed/…"
                icon="i-lucide-video"
              />
            </UFormField>
            <UFormField label="Notes" name="notes">
              <UTextarea
                v-model="replyDrafts[checkIn.id].notes"
                placeholder="What you changed in their plan this week…"
                :rows="3"
                autoresize
              />
            </UFormField>
            <div class="flex justify-end gap-2">
              <UButton
                v-if="editing[checkIn.id]"
                size="sm"
                color="neutral"
                variant="ghost"
                @click="cancelEdit(checkIn)"
              >
                Cancel
              </UButton>
              <UButton
                size="sm"
                color="primary"
                icon="i-lucide-send"
                :loading="submitting === checkIn.id"
                @click="submitReply(checkIn)"
              >
                {{ checkIn.coachReviewedAt ? 'Save reply' : 'Send reply' }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { CheckInFormDefinition, CheckInSectionKey } from '~~/shared/check-in'
  import { CHECK_IN_SECTION_COLORS, coachVideoEmbedUrl } from '~~/shared/check-in'

  interface CoachCheckInRow {
    id: string
    weekStartDate: string
    submittedAt: string
    status: string
    responses: Record<string, string | number | boolean | null>
    coachNotes: string | null
    coachFeedback: string | null
    coachVideoUrl: string | null
    coachReviewedAt: string | null
    form: {
      id: string
      sections: CheckInFormDefinition['sections']
    } | null
  }

  const props = defineProps<{
    athleteId: string
  }>()

  const loading = ref(true)
  const submitting = ref<string | null>(null)
  const error = ref<string | null>(null)
  const checkIns = ref<CoachCheckInRow[]>([])
  const expanded = ref(new Set<string>())
  const editing = ref<Record<string, boolean>>({})
  const replyDrafts = ref<Record<string, { notes: string; videoUrl: string }>>({})
  const toast = useToast()

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

  function sectionAccent(key: CheckInSectionKey) {
    return CHECK_IN_SECTION_COLORS[key]?.[0] ?? '#00A8FF'
  }

  function ratingFields(section: CheckInFormDefinition['sections'][number]) {
    return section.fields.filter((f) => f.type === 'rating' || f.type === 'number')
  }

  function textFields(section: CheckInFormDefinition['sections'][number]) {
    return section.fields.filter((f) => f.type !== 'rating' && f.type !== 'number')
  }

  function displayValue(value: unknown) {
    if (value === null || value === undefined || value === '') return '—'
    return String(value)
  }

  function embedUrl(url: string) {
    return coachVideoEmbedUrl(url)
  }

  function toggle(id: string) {
    const next = new Set(expanded.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    expanded.value = next
  }

  function ensureDraft(ci: CoachCheckInRow) {
    if (!replyDrafts.value[ci.id]) {
      replyDrafts.value[ci.id] = {
        notes: ci.coachNotes || ci.coachFeedback || '',
        videoUrl: ci.coachVideoUrl || ''
      }
    }
  }

  function startEdit(ci: CoachCheckInRow) {
    ensureDraft(ci)
    editing.value[ci.id] = true
  }

  function cancelEdit(ci: CoachCheckInRow) {
    editing.value[ci.id] = false
    replyDrafts.value[ci.id] = {
      notes: ci.coachNotes || ci.coachFeedback || '',
      videoUrl: ci.coachVideoUrl || ''
    }
  }

  async function fetchCheckIns() {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<CoachCheckInRow[]>(
        `/api/coaching/athletes/${props.athleteId}/check-ins`
      )
      checkIns.value = res
      for (const ci of res) {
        ensureDraft(ci)
      }
      // Auto-expand the newest unreplied check-in
      const needsReply = res.find((c) => c.status !== 'REVIEWED')
      if (needsReply) {
        expanded.value = new Set([needsReply.id])
      }
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Failed to fetch check-ins'
    } finally {
      loading.value = false
    }
  }

  async function submitReply(checkIn: CoachCheckInRow) {
    const draft = replyDrafts.value[checkIn.id]
    if (!draft?.notes?.trim() && !draft?.videoUrl?.trim()) {
      toast.add({
        title: 'Add notes or a video URL',
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
      return
    }

    submitting.value = checkIn.id
    try {
      const updated = await $fetch<{
        coachNotes: string | null
        coachFeedback: string | null
        coachVideoUrl: string | null
        coachReviewedAt: string | null
        status: string
      }>(`/api/coaching/check-ins/${checkIn.id}/reply`, {
        method: 'POST',
        body: {
          coachNotes: draft.notes,
          coachVideoUrl: draft.videoUrl || null
        }
      })
      checkIn.coachNotes = updated.coachNotes
      checkIn.coachFeedback = updated.coachFeedback
      checkIn.coachVideoUrl = updated.coachVideoUrl
      checkIn.coachReviewedAt = updated.coachReviewedAt
      checkIn.status = updated.status
      editing.value[checkIn.id] = false
      toast.add({
        title: 'Reply saved',
        description: 'The athlete will see this on their dashboard.',
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
    } catch (err: any) {
      toast.add({
        title: 'Failed to send reply',
        description: err?.data?.message || err?.message || 'Please try again.',
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
    } finally {
      submitting.value = null
    }
  }

  watch(
    () => props.athleteId,
    () => {
      expanded.value = new Set()
      editing.value = {}
      replyDrafts.value = {}
      fetchCheckIns()
    },
    { immediate: true }
  )
</script>
