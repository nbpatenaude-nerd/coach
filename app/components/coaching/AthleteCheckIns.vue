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

        <div v-if="checkIn.notes" class="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
          <p class="text-xs text-neutral-500 uppercase font-bold mb-1">Notes</p>
          <p class="text-sm">{{ checkIn.notes }}</p>
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
  const error = ref<string | null>(null)
  const checkIns = ref<any[]>([])

  function formatFullDate(d: string | Date) {
    if (!d) return ''
    return format(new Date(d), 'MMM d, yyyy')
  }

  async function fetchCheckIns() {
    loading.value = true
    try {
      const res = await $fetch(`/api/coaching/athletes/${props.athleteId}/check-ins`)
      checkIns.value = res
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch check-ins'
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchCheckIns)
</script>
