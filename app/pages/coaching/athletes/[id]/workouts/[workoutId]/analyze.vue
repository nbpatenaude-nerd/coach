<template>
  <UDashboardPanel id="coach-workout-analyze">
    <template #header>
      <UDashboardNavbar title="Athlete Workout Analyzer">
        <template #leading>
          <UButton icon="i-heroicons-arrow-left" color="neutral" variant="ghost" @click="goBack">
            <span class="hidden sm:inline">Back to Calendar</span>
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="h-full min-h-0 overflow-y-auto p-3 sm:p-4">
        <WorkoutAnalyzerShell :workout-id="workoutId" :scope="{ kind: 'coach', athleteId }" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import WorkoutAnalyzerShell from '~/components/workouts/analyzer/WorkoutAnalyzerShell.vue'

  const route = useRoute()
  const router = useRouter()
  const athleteId = route.params.id as string
  const workoutId = route.params.workoutId as string

  function goBack() {
    router.push('/coaching/calendar')
  }
</script>
