<template>
  <UCard class="mb-6 h-full flex flex-col">
    <template #header>
      <div class="flex items-center space-x-2">
        <UIcon name="i-lucide-video" class="w-6 h-6 text-primary" />
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Coach Feedback</h2>
      </div>
    </template>

    <div v-if="status === 'pending'" class="animate-pulse space-y-4">
      <div class="h-40 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
    </div>

    <div v-else-if="error || status === 'error'" class="space-y-4 py-8">
      <UAlert
        icon="i-lucide-alert-triangle"
        color="error"
        variant="soft"
        title="Failed to load feedback"
        description="There was an issue connecting to the server. Please try again."
      />
      <UButton color="neutral" variant="solid" icon="i-lucide-refresh-cw" @click="refresh()">
        Retry
      </UButton>
    </div>

    <div v-else-if="latestFeedback" class="space-y-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Received on {{ formatDate(latestFeedback.createdAt) }}
      </p>

      <div
        class="relative w-full pb-[56.25%] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center"
      >
        <!-- Video Player iframe -->
        <iframe
          v-if="latestFeedback.komodoUrl"
          :src="embedUrl"
          class="absolute top-0 left-0 w-full h-full border-0"
          allow="microphone; camera; display-capture; fullscreen"
          allowfullscreen
        ></iframe>
        <!-- Placeholder when no video is attached -->
        <div
          v-else
          class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500"
        >
          <UIcon name="i-lucide-video-off" class="w-12 h-12 mb-2 opacity-50" />
          <span class="text-sm font-medium">No video attached</span>
        </div>
      </div>

      <div
        class="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-100 dark:border-primary-800 mt-4"
      >
        <h4 class="font-medium text-primary-900 dark:text-primary-100 mb-2">Coach Notes</h4>
        <p class="text-sm text-primary-800 dark:text-primary-200 whitespace-pre-wrap">{{ latestFeedback.coachNotes || 'No notes provided.' }}</p>
      </div>
    </div>

    <div v-else class="py-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
      <UIcon name="i-lucide-inbox" class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>No feedback videos available yet.</p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Feedback {
    id: string
    checkInId?: string
    createdAt: string
    komodoUrl?: string
    coachNotes?: string
  }

  const {
    data: response,
    status,
    error,
    refresh
  } = await useFetch<any>('/api/feedback', { lazy: true })

  const feedbackList = computed<Feedback[]>(() => response.value?.data || [])

  const latestFeedback = computed(() => {
    return feedbackList.value.length > 0 ? feedbackList.value[0] : null
  })

  const embedUrl = computed(() => {
    const url = latestFeedback.value?.komodoUrl
    if (!url) return ''
    if (url.includes('komodo.ai/recordings/')) {
      return url.replace('komodo.ai/recordings/', 'komodo.ai/embed/')
    }
    return url
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }
</script>
