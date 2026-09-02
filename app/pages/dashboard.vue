<template>
  <UDashboardPanel id="dashboard">
    <template #header>
      <UDashboardNavbar :title="t('dashboard_title')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <LayoutPageNavbarActions :overflow-items="dashboardOverflowItems">
            <ClientOnly>
              <DashboardTriggerMonitorButton />
              <NotificationDropdown />
            </ClientOnly>
            <DashboardReleaseNotification />

            <UButton
              to="/workouts/upload"
              icon="i-heroicons-cloud-arrow-up"
              color="neutral"
              variant="ghost"
              class="hidden sm:inline-flex font-black uppercase tracking-widest text-[10px]"
            >
              Upload FIT
            </UButton>
            <UButton
              to="/workouts/upload-csv"
              icon="i-heroicons-table-cells"
              color="neutral"
              variant="ghost"
              class="hidden sm:inline-flex font-black uppercase tracking-widest text-[10px]"
            >
              Upload CSV
            </UButton>

            <UButton
              v-if="canUseDashboardActions"
              :loading="integrationStore.syncingData"
              :disabled="integrationStore.syncingData"
              color="neutral"
              variant="outline"
              icon="i-heroicons-arrow-path"
              size="sm"
              class="font-bold"
              :aria-label="t('header_sync_data')"
              @click="
                () => {
                  void handleSync()
                }
              "
            >
              <span class="hidden md:inline">{{ t('header_sync_data') }}</span>
            </UButton>
            <UButton
              to="/chat"
              icon="i-heroicons-chat-bubble-left-right"
              color="primary"
              variant="solid"
              size="sm"
              class="font-bold"
            >
              <span class="hidden md:inline">{{ t('header_new_chat') }}</span>
              <span class="md:hidden">{{ t('header_chat') }}</span>
            </UButton>

            <template #mobile>
              <LayoutNavbarIconButton
                v-if="canUseDashboardActions"
                icon="i-heroicons-arrow-path"
                :label="t('header_sync_data')"
                :loading="integrationStore.syncingData"
                :disabled="integrationStore.syncingData"
                @click="
                  () => {
                    void handleSync()
                  }
                "
              />
              <LayoutNavbarIconButton
                to="/chat"
                icon="i-heroicons-chat-bubble-left-right"
                :label="t('header_new_chat')"
                color="primary"
                variant="solid"
              />
            </template>
          </LayoutPageNavbarActions>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="quick-capture-inset">
        <ClientOnly>
          <!-- Loading State -->
          <div
            v-if="isLoading || onboardingStatusLoading"
            class="flex justify-center items-center py-24 min-h-[60vh]"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-primary-500" />
          </div>

          <!-- Onboarding View (New User) -->
          <div
            v-else-if="showFullSetupHub && onboardingStatus"
            class="p-4 sm:p-6 max-w-6xl mx-auto"
          >
            <DashboardOnboardingView
              :status="onboardingStatus"
              @sync="handleSync"
              @connect-later="handleConnectLater"
            />
          </div>

          <!-- Dashboard Grid -->
          <template v-else>
            <div class="p-0 sm:p-6 pt-0! space-y-4 sm:space-y-8">
              <DashboardSetupProgressCard
                v-if="showCompactSetupCard && onboardingStatus"
                :status="onboardingStatus"
                @sync="handleSync"
                @complete="handleCompleteSetup"
                @dismiss="handleCompleteSetup"
              />

              <!-- Garmin Attribution -->
              <div v-if="isGarminConnected" class="flex justify-end px-4 sm:px-0">
                <div class="flex items-center gap-1.5">
                  <span
                    class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest"
                    >{{ t('attribution_garmin') }}</span
                  >
                  <img
                    src="/images/logos/Garmin-Tag-black-high-res.png"
                    class="h-5 w-auto dark:hidden"
                    alt="Garmin"
                  />
                  <img
                    src="/images/logos/Garmin-Tag-white-high-res.png"
                    class="h-5 w-auto hidden dark:block"
                    alt="Garmin"
                  />
                </div>
              </div>

              <div v-if="userStore.isTrialActive" class="px-4 sm:px-0">
                <div
                  class="relative overflow-hidden rounded-xl p-4 sm:p-6 shadow-lg group"
                  :class="isTrialEndingSoon ? 'bg-amber-600' : 'bg-primary-600'"
                >
                  <!-- Decorative Icon -->
                  <div
                    class="absolute -right-4 -bottom-4 opacity-10 transform -rotate-12 group-hover:scale-110 transition-transform duration-700"
                  >
                    <UIcon name="i-heroicons-sparkles" class="w-32 h-32 text-white" />
                  </div>

                  <div
                    class="relative flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div class="flex items-start gap-4">
                      <div class="p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
                        <UIcon name="i-heroicons-bolt-solid" class="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div class="flex flex-wrap items-center gap-2">
                          <h3 class="text-white font-black tracking-tight text-lg">
                            {{ trialAccessTitle }}
                          </h3>
                          <UBadge
                            color="neutral"
                            variant="subtle"
                            size="xs"
                            class="bg-white/12 text-white ring-white/20"
                          >
                            {{ t('trial_badge') }}
                          </UBadge>
                        </div>
                        <p class="text-white/80 text-sm font-medium leading-relaxed max-w-xl">
                          {{
                            isTrialEndingSoon
                              ? t('trial_ending_soon_desc', {
                                  date: trialEndsAtLabel
                                })
                              : t('trial_unlock_improvement')
                          }}
                        </p>
                      </div>
                    </div>
                    <div
                      class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0"
                    >
                      <UButton
                        to="/settings/ai"
                        color="neutral"
                        variant="subtle"
                        size="sm"
                        class="justify-center bg-white/10 hover:bg-white/20 text-white font-bold border-none"
                      >
                        {{ t('trial_view_usage') }}
                      </UButton>
                      <UButton
                        to="/settings/billing"
                        color="neutral"
                        variant="solid"
                        size="sm"
                        class="justify-center bg-white text-primary-600 hover:bg-gray-100 font-bold border-none"
                      >
                        {{ t('trial_keep_access') }}
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>

              <DashboardSystemMessageCard />

              <DashboardMissingDataBanner
                v-if="missingFields.length > 0"
                :missing-fields="missingFields"
              />

              <DashboardEventResultPrompt />

              <!-- Free Tier Upgrades -->
              <div v-if="isFree" class="grid gap-4 mb-4 sm:mb-8">
                <UAlert
                  icon="i-heroicons-lock-closed"
                  color="primary"
                  variant="subtle"
                  title="Unleash the Journey Endurance AI Assistant"
                  description="Upgrade your account to get the AI Exercise Physiologist and deeper physiological insights."
                />
                <UCard>
                  <h3 class="font-bold">12-Week Intro Plan</h3>
                  <p class="text-gray-500 text-sm">Your free plan is active.</p>
                </UCard>
              </div>

              <!-- Top Pinned Section -->
              <div
                v-if="hasLoadedDashboardWidgets"
                class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mb-4 sm:mb-8"
              >
                <!-- Weekly Review (1/3) -->
                <div class="col-span-1 h-full">
                  <DashboardCheckIn class="h-full" />
                </div>

                <!-- Coach Feedback (2/3) -->
                <div class="col-span-1 lg:col-span-2 h-full">
                  <DashboardCoachFeedback class="h-full" />
                </div>
              </div>

              <!-- Static Dashboard Grid -->
              <div v-if="hasLoadedDashboardWidgets" class="relative">
                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 items-start grid-flow-dense"
                >
                  <DashboardAthleteProfileCard
                    section="profile"
                    class="col-span-1 lg:col-span-1 h-full"
                  />
                  <DashboardTrainingRecommendationCard
                    class="col-span-1 md:col-span-2 lg:col-span-2 h-full"
                    @open-details="openRecommendationModal"
                    @open-checkin="openCheckinModal"
                  />

                  <DashboardAthleteProfileCard
                    section="trainingLoad"
                    class="col-span-1 lg:col-span-1 h-full"
                  />
                  <DashboardAthleteProfileCard
                    section="corePerformance"
                    class="col-span-1 lg:col-span-1 h-full"
                  />
                  <DashboardAthleteProfileCard
                    section="recentWellness"
                    class="col-span-1 lg:col-span-1 h-full"
                  />

                  <DashboardMonthlyComparisonCard
                    v-if="canUseDashboardActions"
                    class="col-span-1 md:col-span-2 lg:col-span-2 h-full"
                  />
                  <DashboardPerformanceScoresCard
                    ref="performanceScoresCard"
                    class="col-span-1 lg:col-span-1 h-full"
                    @open-score="openScoreModal"
                  />

                  <UCard class="col-span-1 lg:col-span-1 h-full flex flex-col">
                    <h3 class="font-bold mb-1">Active Recovery Context</h3>
                    <div v-if="recommendationStore.loading" class="animate-pulse space-y-2 mt-2">
                      <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div
                      v-else-if="
                        recommendationStore.todayRecommendation?.analysisJson?.recovery_analysis
                      "
                    >
                      <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sleep:
                        {{
                          recommendationStore.todayRecommendation.analysisJson.recovery_analysis
                            .sleep_quality
                        }}
                        - HRV:
                        {{
                          recommendationStore.todayRecommendation.analysisJson.recovery_analysis
                            .hrv_trend
                        }}
                      </p>
                      <p class="text-xs text-gray-500 mt-2 italic">
                        {{
                          recommendationStore.todayRecommendation.analysisJson.recovery_analysis
                            .coach_note
                        }}
                      </p>
                    </div>
                    <div v-else>
                      <p class="text-sm text-gray-500">
                        Recovery algorithms are analyzing your sleep data.
                      </p>
                    </div>
                  </UCard>

                  <UCard class="col-span-1 lg:col-span-1 h-full flex flex-col">
                    <h3 class="font-bold mb-1">Glycogen Fuel Tank</h3>
                    <p class="text-sm text-gray-500">
                      Estimating muscle glycogen depletion based on recent training volume.
                    </p>
                  </UCard>

                  <UCard class="col-span-1 lg:col-span-1 h-full flex flex-col">
                    <h3 class="font-bold mb-1">Telemetry Radar</h3>
                    <p class="text-sm text-gray-500">ACWR, EF, Biomechanical Risk</p>
                  </UCard>

                  <UCard class="col-span-1 lg:col-span-1 h-full flex flex-col">
                    <h3 class="font-bold mb-1">Live Energy Availability</h3>
                    <p class="text-sm text-gray-500">Tracking calorie deficit.</p>
                  </UCard>

                  <DashboardNutritionFuelingCard
                    class="col-span-1 md:col-span-2 lg:col-span-3 h-full"
                    :nutrition="todayNutrition"
                    :settings="nutritionSettings"
                    :is-loading="loadingNutrition"
                    @refresh="handleNutritionRefresh"
                  />

                  <DashboardRecentActivityCard
                    class="col-span-1 md:col-span-2 lg:col-span-2 h-full"
                  />

                  <UCard
                    class="col-span-1 lg:col-span-1 h-full flex flex-col"
                    :ui="{
                      root: 'rounded-none sm:rounded-lg shadow-none sm:shadow',
                      body: 'p-4 sm:p-6'
                    }"
                  >
                    <template #header>
                      <div class="flex items-center justify-between">
                        <h3
                          class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2"
                        >
                          <UIcon name="i-heroicons-calendar-days" class="w-4 h-4" />
                          {{ t('upcoming_workouts_title') }}
                        </h3>
                        <UButton
                          to="/workouts/planned"
                          color="neutral"
                          variant="ghost"
                          icon="i-heroicons-arrow-right"
                          size="2xs"
                        />
                      </div>
                    </template>
                    <div v-if="loadingUpcoming" class="space-y-4">
                      <div v-for="i in 3" :key="i" class="animate-pulse flex gap-4">
                        <div class="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        <div class="flex-1 space-y-2 py-1">
                          <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                          <div class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                    <div
                      v-else-if="upcomingWorkoutsError"
                      class="text-sm text-red-500 dark:text-red-400 py-4 text-center"
                    >
                      {{ upcomingWorkoutsError }}
                    </div>
                    <div
                      v-else-if="upcomingWorkouts.length === 0"
                      class="text-sm text-gray-500 dark:text-gray-400 py-4 text-center"
                    >
                      {{ t('upcoming_workouts_empty') }}
                    </div>
                    <div v-else class="space-y-1">
                      <button
                        v-for="workout in upcomingWorkouts"
                        :key="workout.id"
                        class="w-full text-left flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                        @click="handleUpcomingWorkoutClick(workout.id)"
                      >
                        <div
                          class="flex flex-col items-center justify-center min-w-[3rem] p-1.5 rounded bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                        >
                          <span
                            class="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1"
                            >{{ formatDayShort(workout.scheduledDate) }}</span
                          >
                          <span
                            class="text-lg font-black text-gray-700 dark:text-gray-300 leading-none"
                            >{{ formatDateDay(workout.scheduledDate) }}</span
                          >
                        </div>
                        <div class="flex-1 min-w-0 py-1">
                          <p
                            class="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors"
                          >
                            {{ workout.name }}
                          </p>
                          <div class="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                            <span class="capitalize">{{ workout.sportType }}</span>
                            <span v-if="workout.duration" class="flex items-center gap-1">
                              <span
                                class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"
                              ></span>
                              {{ workout.duration }}m
                            </span>
                            <span v-if="workout.tss" class="flex items-center gap-1">
                              <span
                                class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"
                              ></span>
                              {{ workout.tss }} TSS
                            </span>
                          </div>
                        </div>
                        <UIcon
                          name="i-heroicons-chevron-right"
                          class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-3"
                        />
                      </button>
                    </div>
                  </UCard>

                  <DashboardDataSyncStatus class="col-span-1 lg:col-span-1 h-full" />
                </div>
              </div>

              <!-- App Info Footer -->
              <div class="flex justify-center pt-8 pb-12 sm:pb-4">
                <UButton
                  to="/settings/changelog"
                  variant="link"
                  color="neutral"
                  size="xs"
                  :padded="false"
                  class="text-gray-400 dark:text-gray-500 font-normal hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                >
                  {{ buildVersionDisplay }}
                </UButton>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Recommendation Modal -->
  <DashboardRecommendationDetailModal
    v-model:open="showRecommendationModal"
    :recommendation="recommendationStore.todayRecommendation"
  />

  <!-- Score Detail Modal -->
  <ScoreDetailModal
    v-if="showScoreModal"
    v-model="showScoreModal"
    :title="scoreModalData.title"
    :score="scoreModalData.score"
    :explanation="scoreModalData.explanation"
    :analysis-data="scoreModalData.analysisData"
    :color="scoreModalData.color"
  />

  <!-- Training Load Modal -->
  <TrainingLoadModal v-model:open="showTrainingLoadModal" />

  <!-- Daily Check-in Modal -->
  <DashboardTodayWellnessCheckModal v-model:open="showCheckinModal" />

  <!-- Share Journey Modal -->
  <DashboardShareCoachWattsModal v-model:open="showShareCoachWattsModal" />

  <DashboardTrialEndedModal />
</template>

<script setup lang="ts">
  import { useTranslate } from '@tolgee/vue'
  import { useLocalStorage } from '@vueuse/core'

  import {
    getWorkoutIcon,
    getWorkoutColorClass,
    getWorkoutBorderColorClass
  } from '~/utils/activity-types'
  import { getCalendarActivities } from '~/utils/calendar'
  import { showDashboardProgressToast } from '~/utils/dashboard-progress-toast'

  const { t } = useTranslate('dashboard')
  const { trackWidgetClick } = useAnalytics()
  const { isFree } = useNavigation()

  const { formatDate, formatDateUTC, getUserLocalDate } = useFormat()

  definePageMeta({
    middleware: 'auth'
  })

  useHead({
    title: 'Dashboard',
    meta: [
      {
        name: 'description',
        content:
          "Your daily athlete dashboard. Monitor your recovery, check today's training recommendation, and review your performance trends."
      }
    ]
  })

  const config = useRuntimeConfig()
  const route = useRoute()
  const buildVersionDisplay = computed(
    () =>
      (config.public.buildVersion as string) ||
      `v${config.public.version}+${config.public.buildDate}.${config.public.commitHash}.${config.public.buildCodename}`
  )
  const toast = useToast()

  const integrationStore = useIntegrationStore()
  const {
    status: onboardingStatus,
    isLoading: onboardingStatusLoading,
    activationComplete,
    showFullSetupHub,
    showCompactSetupCard,
    refresh: refreshOnboardingStatus,
    deferConnection,
    completeActivation
  } = useOnboardingStatus()
  const userStore = useUserStore()
  const { missingFields } = storeToRefs(userStore)

  const isGarminConnected = computed(() => {
    return (
      integrationStore.integrationStatus?.integrations?.some((i: any) => i.provider === 'garmin') ??
      false
    )
  })

  const recommendationStore = useRecommendationStore()

  const activityStore = useActivityStore()
  const checkinStore = useCheckinStore()
  const trialAccessTitle = computed(() => {
    const daysRemaining = userStore.trialDaysRemaining || 0
    return typeof t.value === 'function'
      ? t.value('trial_access_remaining', { count: daysRemaining })
      : String(daysRemaining)
  })
  const isTrialEndingSoon = computed(() => {
    const daysRemaining = userStore.trialDaysRemaining || 0
    return daysRemaining > 0 && daysRemaining <= 2
  })
  const trialEndsAtLabel = computed(() => {
    if (!userStore.user?.trialEndsAt) return ''
    return formatDate(userStore.user.trialEndsAt)
  })
  const nutritionEnabled = computed(
    () =>
      userStore.profile?.nutritionTrackingEnabled !== false &&
      userStore.user?.nutritionTrackingEnabled !== false
  )
  const isOnboarded = computed(() => activationComplete.value)
  const performanceScoresCard = ref<{ refresh: () => Promise<unknown> } | null>(null)

  // Background Task Monitoring
  const { refresh: refreshRuns } = useUserRuns()
  const { onTaskCompleted, onTaskFailed } = useUserRunsState()

  async function handleSync() {
    await integrationStore.syncAllData()
    refreshRuns()
  }

  async function handleIngestTaskComplete() {
    integrationStore.syncingData = false
    await integrationStore.fetchStatus()
    await refreshOnboardingStatus()
    await Promise.all([
      userStore.fetchProfile(),
      recommendationStore.fetchTodayRecommendation(),
      activityStore.fetchRecentActivity(),
      fetchUpcomingWorkouts(),
      checkinStore.fetchToday(),
      nutritionEnabled.value ? fetchTodayNutrition() : Promise.resolve()
    ])
  }

  async function handleIngestAllComplete(run: {
    output?: { success?: boolean; failedCount?: number; results?: any[] }
  }) {
    await handleIngestTaskComplete()
    await performanceScoresCard.value?.refresh()

    // Require an explicit success flag — missing output must not look like a full sync.
    const failedCount = Number(run.output?.failedCount || 0)
    const fullySuccessful = run.output?.success === true && failedCount === 0

    showDashboardProgressToast(
      toast,
      {
        title: fullySuccessful ? t.value('sync_toast_title') : t.value('sync_toast_partial_title'),
        description: fullySuccessful
          ? t.value('sync_toast_description')
          : t.value('sync_toast_partial_description', {
              count: failedCount > 0 ? failedCount : 1
            }),
        color: fullySuccessful ? 'success' : 'warning',
        icon: fullySuccessful ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-triangle',
        duration: 2500
      },
      'dashboard.sync.complete'
    )
  }

  async function handleIngestTaskFailed(run: { error?: { message?: string } }) {
    integrationStore.syncingData = false
    await integrationStore.fetchStatus()
    await refreshOnboardingStatus()
    toast.add({
      title: t.value('sync_toast_failed_title') || 'Sync Failed',
      description:
        run.error?.message || t.value('sync_toast_failed_description') || 'Data sync failed',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
  }

  // Listen for sync completion
  onTaskCompleted('ingest-all', handleIngestAllComplete)
  onTaskCompleted('ingest-intervals', handleIngestTaskComplete)
  onTaskCompleted('ingest-strava', handleIngestTaskComplete)

  onTaskFailed('ingest-all', handleIngestTaskFailed)
  onTaskFailed('ingest-intervals', handleIngestTaskFailed)
  onTaskFailed('ingest-strava', handleIngestTaskFailed)

  const showWelcome = useLocalStorage('dashboard-welcome-banner', true)

  const upcomingWorkouts = ref<any[]>([])
  const upcomingWorkoutsError = ref<string | null>(null)
  const todayWorkouts = ref<any[]>([])
  const loadingUpcoming = ref(false)
  const isLoading = ref(true)
  const canUseDashboardActions = computed(
    () =>
      activationComplete.value ||
      onboardingStatus.value?.hasIntegration ||
      onboardingStatus.value?.hasUsableData ||
      false
  )
  const todayNutrition = ref<any>(null)
  const nutritionSettings = ref<any>(null)
  const loadingNutrition = ref(false)
  const hasLoadedDashboardWidgets = ref(false)

  async function loadDashboardWidgets() {
    if (!canUseDashboardActions.value || hasLoadedDashboardWidgets.value) {
      return
    }

    hasLoadedDashboardWidgets.value = true
    await Promise.all([
      userStore.fetchProfile(),
      refreshOnboardingStatus(),
      recommendationStore.fetchTodayRecommendation(),
      activityStore.fetchRecentActivity(),
      fetchUpcomingWorkouts(),
      checkinStore.fetchToday(),
      nutritionEnabled.value ? fetchTodayNutrition() : Promise.resolve()
    ])
  }

  async function fetchTodayNutrition() {
    if (!nutritionEnabled.value) {
      todayNutrition.value = null
      nutritionSettings.value = null
      loadingNutrition.value = false
      return
    }
    loadingNutrition.value = true
    try {
      const dateStr = formatDateUTC(getUserLocalDate(), 'yyyy-MM-dd')
      const [nData, calendarData, sData] = await Promise.all([
        ($fetch as any)(`/api/nutrition/${dateStr}`),
        ($fetch as any)('/api/calendar', {
          query: { startDate: dateStr, endDate: dateStr }
        }),
        ($fetch as any)('/api/profile/nutrition')
      ])
      todayNutrition.value = nData

      // Filter out non-training items like wellness/nutrition placeholders and notes
      todayWorkouts.value = getCalendarActivities(calendarData).filter(
        (a: any) =>
          (a.source === 'completed' || a.source === 'planned') &&
          a.type !== 'Rest' &&
          a.type !== 'Note'
      )
      nutritionSettings.value = sData.settings
    } catch (error: any) {
      if (error.statusCode !== 404) {
        console.error('Failed to fetch today nutrition:', error)
      }
    } finally {
      loadingNutrition.value = false
    }
  }

  function handleNutritionRefresh() {
    trackWidgetClick('nutrition_fueling', 'refresh')
    return fetchTodayNutrition()
  }

  async function fetchUpcomingWorkouts() {
    loadingUpcoming.value = true
    upcomingWorkoutsError.value = null
    try {
      const { workouts } = (await ($fetch as any)('/api/workouts/planned/upcoming')) as {
        workouts: any[]
      }
      if (workouts) {
        upcomingWorkouts.value = workouts
      }
    } catch (error: any) {
      console.error('Failed to fetch upcoming workouts:', error)
      upcomingWorkoutsError.value =
        error?.statusMessage || error?.message || t.value('upcoming_workouts_error')
    } finally {
      loadingUpcoming.value = false
    }
  }

  function formatDayShort(d: string) {
    return formatDateUTC(d, 'EEE')
  }

  function formatDateDay(d: string) {
    return formatDateUTC(d, 'd')
  }

  function handleUpcomingWorkoutClick(workoutId: string) {
    trackWidgetClick('upcoming_workouts', 'open_workout')
    return navigateTo(`/workouts/planned/${workoutId}`)
  }

  async function handleConnectLater() {
    await deferConnection()
  }

  async function handleCompleteSetup() {
    await completeActivation('dashboard_insight')
    await Promise.all([
      recommendationStore.fetchTodayRecommendation(),
      activityStore.fetchRecentActivity(),
      fetchUpcomingWorkouts(),
      checkinStore.fetchToday(),
      nutritionEnabled.value ? fetchTodayNutrition() : Promise.resolve()
    ])
  }

  // Initial data fetch
  onMounted(async () => {
    try {
      await Promise.all([
        integrationStore.fetchStatus(),
        userStore.fetchProfile(),
        refreshOnboardingStatus()
      ])
      await loadDashboardWidgets()
    } finally {
      isLoading.value = false
    }
  })

  watch(canUseDashboardActions, async (enabled) => {
    if (enabled) {
      await loadDashboardWidgets()
    }
  })

  watch(
    () => onboardingStatus.value?.hasFirstInsight,
    async (ready) => {
      if (ready && onboardingStatus.value?.hasUsableData && !activationComplete.value) {
        await refreshOnboardingStatus()
      }
    }
  )

  // Recommendation state
  const showRecommendationModal = ref(false)

  // Wellness modal state
  const showWellnessModal = ref(false)
  const wellnessModalDate = ref<Date | null>(null)

  // Score detail modal state
  const showScoreModal = ref(false)
  const scoreModalData = ref<{
    title: string
    score: number | null
    explanation: string | null
    analysisData?: any
    color?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'cyan'
  }>({
    title: '',
    score: null,
    explanation: null,
    analysisData: undefined,
    color: undefined
  })

  function openRecommendationModal() {
    trackWidgetClick('training_recommendation', 'open_details')
    showRecommendationModal.value = true
  }

  // Wellness modal handlers
  function openWellnessModal() {
    trackWidgetClick('athlete_profile', 'open_wellness')
    // Use today's date or the latest wellness date
    const latestDate = userStore.profile?.latestWellnessDate
      ? new Date(userStore.profile.latestWellnessDate)
      : getUserLocalDate()

    const today = getUserLocalDate()
    wellnessModalDate.value = latestDate > today ? today : latestDate
    showCheckinModal.value = true
  }

  // Function to open score detail modal
  function openScoreModal(data: any) {
    trackWidgetClick('performance_scores', data.title || 'open_score')
    scoreModalData.value = data
    showScoreModal.value = true
  }

  // Training Load modal
  const showTrainingLoadModal = ref(false)

  function openTrainingLoadModal() {
    trackWidgetClick('performance_scores', 'open_training_load')
    showTrainingLoadModal.value = true
  }

  // Daily Check-in Modal
  const showCheckinModal = ref(false)
  function openCheckinModal() {
    trackWidgetClick('training_recommendation', 'open_checkin')
    showCheckinModal.value = true
  }

  watch(
    () => route.query.focus,
    async (focus) => {
      if (focus !== 'checkin' && focus !== 'wellness') return

      if (focus === 'checkin') {
        openCheckinModal()
      } else {
        openWellnessModal()
      }

      const nextQuery = { ...route.query }
      delete nextQuery.focus
      await navigateTo({ path: route.path, query: nextQuery }, { replace: true })
    },
    { immediate: true }
  )

  // Share Journey Modal
  const showShareCoachWattsModal = ref(false)
  const { openReleaseModal } = useReleaseNotes()
  const { toggle: toggleTriggerMonitor } = useTriggerMonitor()

  const dashboardOverflowItems = computed(() => {
    const items: Array<{
      label: string
      icon?: string
      to?: string
      onSelect?: () => void
    }> = [
      {
        label: t.value('share_footer_button'),
        icon: 'i-lucide-heart',
        onSelect: () => {
          showShareCoachWattsModal.value = true
        }
      },
      {
        label: t.value('navbar_tasks'),
        icon: 'i-heroicons-cpu-chip',
        onSelect: () => {
          toggleTriggerMonitor()
        }
      },
      {
        label: t.value('navbar_notifications'),
        icon: 'i-heroicons-bell',
        to: '/notifications'
      },
      {
        label: t.value('navbar_whats_new'),
        icon: 'i-heroicons-gift',
        onSelect: () => {
          void openReleaseModal()
        }
      },
      {
        label: t.value('header_upload'),
        icon: 'i-heroicons-cloud-arrow-up',
        to: '/workouts/upload'
      }
    ]

    return [items]
  })

  useHead({
    title: 'Dashboard',
    meta: [
      {
        name: 'description',
        content:
          'Your training overview, recovery status, and personalized AI-assisted recommendations to keep you on track.'
      },
      { property: 'og:title', content: 'Dashboard | Journey Endurance Coaching' },
      {
        property: 'og:description',
        content:
          'Your training overview, recovery status, and personalized AI-assisted recommendations to keep you on track.'
      }
    ]
  })
</script>
