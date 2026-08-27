<template>
  <div class="space-y-4">
    <UCard v-if="pending">
      <div class="flex justify-center p-8">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
      </div>
    </UCard>
    <div
      v-else-if="!history || history.length === 0"
      class="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl"
    >
      <UIcon name="i-heroicons-clock" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">No history yet</h3>
      <p class="text-gray-500">Your daily check-ins will appear here.</p>
    </div>
    <div v-else class="space-y-4">
      <UCard v-for="entry in history" :key="entry.id" class="overflow-hidden">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ formatDateUTC(entry.date, 'EEEE, MMM do, yyyy') }}
            </h3>
            <UBadge :color="entry.status === 'ACCEPTED' ? 'success' : 'neutral'">
              {{ entry.status || 'SUBMITTED' }}
            </UBadge>
          </div>
        </template>
        <div class="space-y-4">
          <div
            v-if="entry.userNotes"
            class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm italic"
          >
            "{{ entry.userNotes }}"
          </div>

          <div v-if="getAnswers(entry).length > 0">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Answers</h4>
            <div class="space-y-2">
              <div v-for="ans in getAnswers(entry)" :key="ans.question" class="text-sm">
                <span class="font-medium text-gray-700 dark:text-gray-300"
                  >{{ ans.question }}:</span
                >
                <span class="text-gray-600 dark:text-gray-400">{{ ans.answer }}</span>
              </div>
            </div>
          </div>

          <div v-if="hasWellnessUpdates(entry)">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">
              Metrics Logged
            </h4>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="(val, key) in getWellnessUpdates(entry)"
                :key="key"
                color="neutral"
                variant="soft"
              >
                {{ formatMetricKey(key.toString()) }}: {{ val }}
              </UBadge>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  const { formatDateUTC } = useFormat()
  const { data: history, pending } = useFetch<any[]>('/api/checkin/history', {
    query: { limit: 30 }
  })

  function getAnswers(entry: any) {
    if (!entry?.questions) return []
    const parsedAnswers =
      typeof entry.answers === 'string' ? JSON.parse(entry.answers) : entry.answers || {}
    const result: { question: string; answer: string }[] = []

    entry.questions.forEach((q: any) => {
      const answer = parsedAnswers[q.id]
      if (answer) {
        result.push({ question: q.title, answer })
      }
    })
    return result
  }

  function getWellnessUpdates(entry: any) {
    if (!entry?.wellnessUpdates) return {}
    return typeof entry.wellnessUpdates === 'string'
      ? JSON.parse(entry.wellnessUpdates)
      : entry.wellnessUpdates
  }

  function hasWellnessUpdates(entry: any) {
    return Object.keys(getWellnessUpdates(entry)).length > 0
  }

  function formatMetricKey(key: string) {
    if (key.startsWith('customMetrics.')) {
      return key.replace('customMetrics.', '')
    }
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
  }
</script>
