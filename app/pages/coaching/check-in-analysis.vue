<template>
  <div class="flex h-[calc(100vh-4rem)]">
    <!-- Sidebar / Athlete Selector -->
    <div class="w-64 border-r border-border bg-muted/10 p-4 flex flex-col gap-4 overflow-y-auto">
      <h2 class="font-semibold text-foreground uppercase tracking-wider text-sm mb-2">
        Select Athlete
      </h2>
      <div v-if="pendingAthletes" class="text-sm text-muted-foreground text-center">Loading...</div>
      <div v-else-if="athletes?.length === 0" class="text-sm text-muted-foreground">
        No athletes found.
      </div>
      <div v-else class="flex flex-col gap-2">
        <button
          v-for="athlete in athletes"
          :key="athlete.id"
          class="flex items-center gap-3 w-full text-left p-2 rounded-lg transition-colors border"
          :class="
            selectedAthleteId === athlete.id
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-transparent border-transparent hover:bg-muted text-foreground'
          "
          @click="selectedAthleteId = athlete.id"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-inner"
            :class="
              selectedAthleteId === athlete.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted-foreground/20'
            "
          >
            {{ athlete.name ? athlete.name.charAt(0).toUpperCase() : 'U' }}
          </div>
          <div class="flex-1 overflow-hidden">
            <div class="font-medium text-sm truncate">{{ athlete.name || 'Unnamed' }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-6 bg-background">
      <div
        v-if="!selectedAthleteId"
        class="h-full flex flex-col items-center justify-center text-muted-foreground"
      >
        <UIcon name="i-lucide-line-chart" class="w-16 h-16 mb-4 opacity-50" />
        <p class="text-lg">Select an athlete to view Check-In Analysis</p>
      </div>

      <div v-else class="space-y-8">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-foreground">The Road of Trials</h1>
          <p class="text-muted-foreground mt-1">Check-in metrics and analysis over time.</p>
        </div>

        <div
          v-if="pendingCheckins"
          class="p-12 text-center text-muted-foreground flex flex-col items-center"
        >
          <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin mb-4 text-primary" />
          <p>Loading check-ins...</p>
        </div>

        <div
          v-else-if="!checkins || checkins.length === 0"
          class="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground shadow-sm"
        >
          <UIcon name="i-lucide-inbox" class="w-12 h-12 mb-3 mx-auto opacity-50" />
          <p>No check-ins found for this athlete.</p>
        </div>

        <div v-else class="space-y-6">
          <!-- Submission History -->
          <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div class="p-4 border-b border-border bg-muted/20">
              <h2 class="font-semibold text-lg text-foreground">Recent Submissions</h2>
            </div>
            <div class="divide-y divide-border">
              <div v-for="checkin in checkins" :key="checkin.id" class="p-4">
                <div class="flex justify-between items-center mb-3">
                  <span class="font-medium text-foreground"
                    >Submitted {{ new Date(checkin.createdAt).toLocaleDateString() }}</span
                  >
                  <span
                    class="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full uppercase tracking-wider"
                  >
                    {{ new Date(checkin.createdAt).toLocaleString() }}
                  </span>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div class="bg-background rounded-lg p-3 border border-border">
                    <p class="text-xs text-muted-foreground mb-1">Fatigue</p>
                    <p class="font-bold text-foreground">
                      {{ checkin.personalFatigue || '--' }}/10
                    </p>
                  </div>
                  <div class="bg-background rounded-lg p-3 border border-border">
                    <p class="text-xs text-muted-foreground mb-1">Stress</p>
                    <p class="font-bold text-foreground">{{ checkin.wellnessStress || '--' }}/10</p>
                  </div>
                  <div class="bg-background rounded-lg p-3 border border-border">
                    <p class="text-xs text-muted-foreground mb-1">Sleep Quality</p>
                    <p class="font-bold text-foreground">{{ checkin.wellnessSleep || '--' }}/10</p>
                  </div>
                  <div class="bg-background rounded-lg p-3 border border-border">
                    <p class="text-xs text-muted-foreground mb-1">Nutrition</p>
                    <p class="font-bold text-foreground">
                      {{ checkin.trainingNutrition || '--' }}/10
                    </p>
                  </div>
                </div>

                <div
                  v-if="
                    checkin.personalNotes ||
                    checkin.personalChallenges ||
                    checkin.personalHighlights ||
                    checkin.wellnessInjury ||
                    checkin.wellnessPain
                  "
                  class="mt-4 bg-muted/30 p-4 rounded-lg space-y-3 border border-border/50"
                >
                  <div v-if="checkin.personalNotes">
                    <p class="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Notes</p>
                    <p class="text-sm text-foreground whitespace-pre-wrap">{{ checkin.personalNotes }}</p>
                  </div>
                  <div v-if="checkin.personalChallenges">
                    <p class="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Challenges</p>
                    <p class="text-sm text-foreground whitespace-pre-wrap">{{ checkin.personalChallenges }}</p>
                  </div>
                  <div v-if="checkin.personalHighlights">
                    <p class="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Highlights</p>
                    <p class="text-sm text-foreground whitespace-pre-wrap">{{ checkin.personalHighlights }}</p>
                  </div>
                  <div v-if="checkin.wellnessInjury">
                    <p class="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Injuries</p>
                    <p class="text-sm text-foreground whitespace-pre-wrap">{{ checkin.wellnessInjury }}</p>
                  </div>
                  <div v-if="checkin.wellnessPain">
                    <p class="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Pain</p>
                    <p class="text-sm text-foreground whitespace-pre-wrap">{{ checkin.wellnessPain }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'

  definePageMeta({
    middleware: ['auth', 'coach'] as any
  })

  // We are fetching athletes for the current coach (or all if admin)
  const { data: athletes, pending: pendingAthletes } = await useFetch<any[]>('/api/coaching/crm/athletes')
  const selectedAthleteId = ref<string | null>(null)

  const { data: checkinsResponse, pending: pendingCheckins, refresh: refreshCheckins } = await useFetch<any>(() => selectedAthleteId.value ? `/api/coaching/athletes/${selectedAthleteId.value}/legacy-check-ins` : '', {
    immediate: false,
    lazy: true
  })

  const checkins = computed(() => checkinsResponse.value?.data || [])

  watch(selectedAthleteId, (newId) => {
    if (newId) {
      refreshCheckins()
    }
  })
</script>
