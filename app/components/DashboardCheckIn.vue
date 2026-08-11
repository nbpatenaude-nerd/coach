<template>
  <UCard class="mb-6 h-full flex flex-col justify-center items-center text-center py-8">
    <template v-if="status === 'pending'">
      <div class="flex flex-col items-center justify-center animate-pulse">
        <div class="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
        <div class="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
        <div class="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>
        <div class="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
      </div>
    </template>
    <template v-else-if="isCompletedThisWeek">
      <UIcon
        name="i-heroicons-check-circle-solid"
        class="w-12 h-12 text-success-500 mb-4 mx-auto"
      />
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Weekly Check-In Complete!
      </h2>
      <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto text-sm">
        Great job tracking your progress this week. Your coach has all the context they need.
      </p>
      <UButton to="/check-in" color="neutral" variant="outline" size="sm">
        View or Edit Check-In
      </UButton>
    </template>
    <template v-else>
      <UIcon
        name="i-heroicons-clipboard-document-list"
        class="w-12 h-12 text-primary-500 mb-4 mx-auto"
      />
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Ready for your weekly review?
      </h2>
      <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto text-sm">
        Track your progress, log your wellness metrics, and give your coach the context they need.
      </p>
      <UButton to="/check-in" color="primary" size="lg" icon="i-heroicons-arrow-right" trailing>
        Complete Check-In
      </UButton>
    </template>
  </UCard>
</template>

<script setup lang="ts">
  const { data: history, status } = await useFetch<any[]>('/api/check-ins/history', {
    lazy: true,
    server: false,
    default: () => []
  })

  const isCompletedThisWeek = computed(() => {
    if (!history.value || history.value.length === 0) return false

    // Find the most recent checkin
    const latest = history.value[history.value.length - 1]
    const latestDate = new Date(latest.createdAt)

    const now = new Date()
    const dayOfWeek = now.getDay() // 0 is Sunday
    const lastSunday = new Date(now)
    lastSunday.setDate(now.getDate() - dayOfWeek)
    lastSunday.setHours(0, 0, 0, 0)

    return latestDate >= lastSunday
  })
</script>
