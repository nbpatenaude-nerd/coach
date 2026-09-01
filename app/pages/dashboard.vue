<template>
  <UDashboardPanel id="dashboard">
    <template #header>
      <UDashboardNavbar :title="t('dashboard_title')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <LayoutPageNavbarActions :overflow-items="dashboardOverflowItems">
            <UButton
              v-if="canUseDashboardActions"
              :color="isEditMode ? 'primary' : 'neutral'"
              :variant="isEditMode ? 'solid' : 'ghost'"
              icon="i-heroicons-squares-2x2"
              class="hidden sm:inline-flex font-bold text-xs"
              @click="toggleEditMode"
            >
              {{ isEditMode ? 'Done Editing' : 'Customize Layout' }}
            </UButton>

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

              <!-- Draggable Dashboard Grid (Rendered statically, customized in Slideover) -->
              <div v-if="hasLoadedDashboardWidgets" class="relative">
                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 items-start grid-flow-dense"
                >
                  <div
                    v-for="element in dashboardLayout"
                    :key="element.id"
                    :class="['transition-all duration-200 break-inside-avoid', element.class]"
                  >
                    <div class="h-full">
                      <template v-if="element.id === 'athleteProfileBasic'">
                        <AthleteProfileCard section="profile" class="h-full" />
                      </template>
                      <template v-else-if="element.id === 'trainingLoad'">
                        <AthleteProfileCard section="trainingLoad" class="h-full" />
                      </template>
                      <template v-else-if="element.id === 'corePerformance'">
                        <AthleteProfileCard section="corePerformance" class="h-full" />
                      </template>
                      <template v-else-if="element.id === 'recentWellness'">
                        <AthleteProfileCard section="recentWellness" class="h-full" />
                      </template>

                      <template v-else-if="element.id === 'recoveryContext'">
                        <UCard class="h-full flex flex-col">
                          <h3 class="font-bold mb-1">Active Recovery Context</h3>
                          <div
                            v-if="recommendationStore.loading"
                            class="animate-pulse space-y-2 mt-2"
                          >
                            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
                          <div
                            v-else-if="
                              recommendationStore.todayRecommendation?.analysisJson
                                ?.recovery_analysis
                            "
                          >
                            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Sleep:
                              {{
                                recommendationStore.todayRecommendation.analysisJson
                                  .recovery_analysis.sleep_quality
                              }}
                              &bull; HRV:
                              {{
                                recommendationStore.todayRecommendation.analysisJson
                                  .recovery_analysis.hrv_status
                              }}
                            </p>
                            <p class="text-sm text-gray-500 mt-1">
                              Fatigue Level:
                              {{
                                recommendationStore.todayRecommendation.analysisJson
                                  .recovery_analysis.fatigue_level
                              }}
                              <span
                                v-if="
                                  recommendationStore.todayRecommendation.analysisJson
                                    .recovery_analysis.stress_level
                                "
                              >
                                &bull; Stress:
                                {{
                                  recommendationStore.todayRecommendation.analysisJson
                                    .recovery_analysis.stress_level
                                }}
                              </span>
                            </p>
                            <p class="text-sm text-gray-500 mt-2">
                              {{
                                recommendationStore.todayRecommendation.analysisJson
                                  .recovery_analysis.key_limiter ||
                                "Journey will use this when generating today's guidance."
                              }}
                            </p>
                          </div>
                          <div v-else>
                            <p class="text-sm text-gray-500 mt-1">
                              Journey will use this when generating today's guidance.
                            </p>
                          </div>
                        </UCard>
                      </template>
                      <template v-else-if="element.id === 'glycogenFuel'">
                        <DashboardGlycogenFuelCard class="h-full" />
                      </template>

                      <template v-else-if="element.id === 'telemetryRadar'">
                        <DashboardTelemetryRadarCard class="h-full" />
                      </template>
                      <template v-else-if="element.id === 'liveEnergy'">
                        <DashboardLiveEnergyCard class="h-full" />
                      </template>

                      <template v-else-if="element.id === 'trainingRecommendation'">
                        <DashboardTrainingRecommendationCard
                          class="h-full"
                          @open-details="openRecommendationModal"
                          @open-checkin="openCheckinModal"
                        />
                      </template>

                      <template v-else-if="element.id === 'performanceScores'">
                        <DashboardPerformanceScoresCard
                          class="h-full"
                          @open-wellness="openWellnessModal"
                          @open-score="openScoreModal"
                        />
                      </template>

                      <template v-else-if="element.id === 'monthlyComparison'">
                        <DashboardMonthlyComparisonCard class="h-full" />
                      </template>

                      <template v-else-if="element.id === 'nutritionFueling' && nutritionEnabled">
                        <DashboardNutritionFuelingCard
                          class="h-full"
                          :nutrition="todayNutrition"
                          :workouts="todayWorkouts"
                          :settings="nutritionSettings"
                          :weight="(userStore.user as any)?.weight"
                          :loading="loadingNutrition"
                          @refresh="fetchTodayNutrition"
                        />
                      </template>

                      <template v-else-if="element.id === 'recentActivity'">
                        <DashboardRecentActivityCard class="h-full" />
                      </template>

                      <template v-else-if="element.id === 'upcomingWorkouts'">
                        <DashboardUpcomingWorkouts class="h-full" />
                      </template>

                      <template v-else-if="element.id === 'dataSyncStatus'">
                        <DashboardDataSyncStatusCard
                          v-if="integrationStore.syncingData"
                          class="h-full"
                        />
                      </template>
                    </div>
                  </div>
                </div>

                <DashboardShareFooterCard class="mt-8" />
              </div>

              <!-- Dashboard Customizer Slideover -->
              <DashboardLayoutCustomizer
                v-model:open="isEditMode"
                :layout="dashboardLayout"
                @update="handleLayoutUpdate"
              />

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

  const isEditMode = ref(false)

  const DEFAULT_DASHBOARD_LAYOUT = [
    { id: 'athleteProfileBasic', class: 'col-span-1 lg:col-span-1' },
    { id: 'trainingLoad', class: 'col-span-1 lg:col-span-1' },
    { id: 'corePerformance', class: 'col-span-1 lg:col-span-1' },
    { id: 'recentWellness', class: 'col-span-1 lg:col-span-1' },
    { id: 'trainingRecommendation', class: 'col-span-1 lg:col-span-1' },
    { id: 'performanceScores', class: 'col-span-1 lg:col-span-1' },
    { id: 'monthlyComparison', class: 'col-span-1 lg:col-span-1' },
    { id: 'recoveryContext', class: 'col-span-1' },
    { id: 'glycogenFuel', class: 'col-span-1' },
    { id: 'telemetryRadar', class: 'col-span-1 lg:col-span-1' },
    { id: 'liveEnergy', class: 'col-span-1 lg:col-span-1' },
    { id: 'nutritionFueling', class: 'col-span-1 md:col-span-2 lg:col-span-3' },
    { id: 'recentActivity', class: 'col-span-1 lg:col-span-1' },
    { id: 'upcomingWorkouts', class: 'col-span-1 lg:col-span-1' },
    { id: 'dataSyncStatus', class: 'col-span-1 lg:col-span-1' }
  ]

  const dashboardLayout = ref([...DEFAULT_DASHBOARD_LAYOUT])

  watch(
    () => userStore.user?.dashboardSettings,
    (newSettings) => {
      if (newSettings && newSettings.layout && Array.isArray(newSettings.layout)) {
        const deprecatedIds = ['coachFeedback', 'athleteProfile', 'reviewFeedback']
        const validLayout = newSettings.layout.filter(
          (item: any) => !deprecatedIds.includes(item.id)
        )
        const savedIds = validLayout.map((item: any) => item.id)
        const missingComponents = DEFAULT_DASHBOARD_LAYOUT.filter(
          (item) => !savedIds.includes(item.id)
        )

        dashboardLayout.value = [...validLayout, ...missingComponents]
      }
    },
    { immediate: true, deep: true }
  )

  function toggleEditMode() {
    isEditMode.value = !isEditMode.value
    if (!isEditMode.value) {
      saveLayout()
    }
  }

  function handleLayoutUpdate(newLayout: any[]) {
    dashboardLayout.value = newLayout
    saveLayout()
  }

  function saveLayout() {
    if (userStore.updateDashboardSettings) {
      // Create a clean serializable copy
      const layoutToSave = dashboardLayout.value.map((item) => ({ id: item.id, class: item.class }))
      userStore.updateDashboardSettings({ layout: layoutToSave })
    }
  }

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
