<template>
  <UDashboardPanel id="workout-map-detail">
    <template #header>
      <UDashboardNavbar title="Workout Analyzer">
        <template #leading>
          <UButton
            icon="i-heroicons-arrow-left"
            color="neutral"
            variant="ghost"
            aria-label="Back to Workout"
            @click="goBack"
          >
            <span class="hidden sm:inline">Back to Workout</span>
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="h-full min-h-0 overflow-y-auto p-3 sm:p-4">
        <WorkoutAnalyzerShell :workout-id="workoutId" :scope="{ kind: 'athlete' }" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import WorkoutAnalyzerShell from '~/components/workouts/analyzer/WorkoutAnalyzerShell.vue'

  const route = useRoute()
  const router = useRouter()
  const workoutId = route.params.id as string

  function goBack() {
    router.push(`/workouts/${workoutId}`)
  }
</script>
