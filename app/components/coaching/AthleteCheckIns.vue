<template>
  <div class="space-y-6">
    <div v-if="loading" class="space-y-4">
      <USkeleton v-for="i in 3" :key="i" class="h-32 w-full" />
    </div>

    <div v-else-if="error">
      <UAlert color="error" title="Failed to load check-ins" :description="error" />
    </div>

    <div v-else-if="checkIns.length === 0">
      <UCard class="text-center py-12 bg-neutral-50 dark:bg-neutral-800/30">
        <div class="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-full mb-3 inline-block">
          <UIcon name="i-heroicons-clipboard-document" class="w-6 h-6 text-neutral-400" />
        </div>
        <p class="text-neutral-500 text-sm">No check-ins have been submitted yet.</p>
      </UCard>
    </div>

    <div v-else class="space-y-4">
      <UCard v-for="checkIn in checkIns" :key="checkIn.id">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-gray-900 dark:text-white">
              Week of {{ formatFullDate(checkIn.weekStartDate) }}
            </h3>
            <span class="text-xs text-neutral-500">
              Submitted {{ formatFullDate(checkIn.submittedAt) }}
            </span>
          </div>
        </template>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <p class="text-xs text-neutral-500 uppercase font-bold">Feeling</p>
            <p class="text-xl font-bold">{{ checkIn.feelingScore || '--' }}/10</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500 uppercase font-bold">Fatigue</p>
            <p class="text-xl font-bold">{{ checkIn.fatigueScore || '--' }}/10</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500 uppercase font-bold">Stress</p>
            <p class="text-xl font-bold">{{ checkIn.stressScore || '--' }}/10</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500 uppercase font-bold">Sleep</p>
            <p class="text-xl font-bold">{{ checkIn.sleepQuality || '--' }}/10</p>
          </div>
        </div>

        <div v-if="checkIn.notes" class="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg mb-4">
          <p class="text-xs text-neutral-500 uppercase font-bold mb-1">Notes</p>
          <p class="text-sm">{{ checkIn.notes }}</p>
        </div>

        <div v-if="checkIn.coachReviewedAt" class="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
          <div class="flex justify-between items-center mb-2">
            <p class="text-xs text-primary-600 dark:text-primary-400 uppercase font-bold">Your Reply</p>
            <UButton size="xs" variant="ghost" color="primary" @click="checkIn.coachReviewedAt = null">Edit Reply</UButton>
          </div>
          <div v-if="checkIn.coachVideoUrl" class="mb-3">
            <video :src="checkIn.coachVideoUrl" controls class="w-full max-w-md rounded-md shadow-sm"></video>
          </div>
          <p class="text-sm">{{ checkIn.coachFeedback }}</p>
        </div>

        <div v-else class="border-t border-neutral-200 dark:border-neutral-800 mt-4 pt-4">
          <p class="text-sm font-bold mb-2">Reply to Check-In</p>
          <UFormGroup label="Video URL (optional)" class="mb-3">
            <UInput v-model="replyDrafts[checkIn.id].videoUrl" placeholder="https://..." icon="i-lucide-video" />
          </UFormGroup>
          <UFormGroup label="Feedback" class="mb-3">
            <UTextarea v-model="replyDrafts[checkIn.id].feedback" placeholder="Write your response to the athlete..." :rows="3" />
          </UFormGroup>
          <UButton color="primary" :loading="submitting === checkIn.id" @click="submitReply(checkIn)">Send Reply</UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { format } from 'date-fns'

  const props = defineProps<{
    athleteId: string
  }>()

  const loading = ref(true)
  const submitting = ref<string | null>(null)
  const error = ref<string | null>(null)
  const checkIns = ref<any[]>([])
  const replyDrafts = ref<Record<string, { feedback: string, videoUrl: string }>>({})
  const toast = useToast()

  function formatFullDate(d: string | Date) {
    if (!d) return ''
    return format(new Date(d), 'MMM d, yyyy')
  }

  async function fetchCheckIns() {
    loading.value = true
    try {
      const res = await $fetch(`/api/coaching/athletes/${props.athleteId}/check-ins`)
      checkIns.value = res
      
      // Initialize drafts
      res.forEach((ci: any) => {
        if (!replyDrafts.value[ci.id]) {
          replyDrafts.value[ci.id] = { feedback: ci.coachFeedback || '', videoUrl: ci.coachVideoUrl || '' }
        }
      })
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch check-ins'
    } finally {
      loading.value = false
    }
  }

  async function submitReply(checkIn: any) {
    const draft = replyDrafts.value[checkIn.id]
    if (!draft.feedback && !draft.videoUrl) {
      toast.add({ title: 'Please provide feedback or a video URL', color: 'error' })
      return
    }

    submitting.value = checkIn.id
    try {
      const updated = await $fetch(`/api/coaching/check-ins/${checkIn.id}/reply`, {
        method: 'POST',
        body: {
          coachFeedback: draft.feedback,
          coachVideoUrl: draft.videoUrl
        }
      })
      checkIn.coachFeedback = updated.coachFeedback
      checkIn.coachVideoUrl = updated.coachVideoUrl
      checkIn.coachReviewedAt = updated.coachReviewedAt
      toast.add({ title: 'Reply sent successfully', color: 'success' })
    } catch (err: any) {
      toast.add({ title: 'Failed to send reply', color: 'error' })
    } finally {
      submitting.value = null
    }
  }

  onMounted(fetchCheckIns)
</script>
