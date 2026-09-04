<template>
  <UDashboardPage>
    <UDashboardPanel id="daily-checkins" grow>
      <template #header>
        <UDashboardNavbar title="Daily Check-Ins">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
      </template>

      <div class="p-0 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto w-full">
        <div
          class="px-4 sm:px-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 class="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              Wellness Log
            </h1>
            <p
              class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mt-1 italic"
            >
              Your historical daily check-in data
            </p>
          </div>
          <UButton
            color="primary"
            variant="solid"
            icon="i-heroicons-plus"
            @click="isCheckinModalOpen = true"
          >
            Log Today
          </UButton>
        </div>

        <div class="px-4 sm:px-0">
          <DashboardDailyCheckinHistory />
        </div>
      </div>
    </UDashboardPanel>

    <DashboardTodayWellnessCheckModal v-model:open="isCheckinModalOpen" />
  </UDashboardPage>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  definePageMeta({
    middleware: ['auth']
  })

  useHead({
    title: 'Daily Check-Ins - Journey'
  })

  const isCheckinModalOpen = ref(false)
</script>
