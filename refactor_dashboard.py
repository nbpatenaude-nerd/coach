import re

with open('app/pages/dashboard.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the layout grid to static rendering
grid_regex = r'<!-- Draggable Dashboard Grid -->\s*<div v-if="hasLoadedDashboardWidgets" class="relative">.*?<!-- Ask Coach Floating Button -->'

new_grid = """<!-- Top Pinned Section -->
              <div v-if="hasLoadedDashboardWidgets" class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mb-4 sm:mb-8">
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
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 items-start">
                  <div
                    v-for="element in dashboardLayout"
                    :key="element.id"
                    :class="['transition-all duration-200', element.class]"
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
                                  'Journey will use this when generating today\\'s guidance.'
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
                          <DashboardTrainingRecommendationCard class="h-full" />
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

                        <template v-else-if="element.id === 'nutritionFueling'">
                          <DashboardNutritionFuelingCard class="h-full" />
                        </template>

                        <template v-else-if="element.id === 'recentActivity'">
                          <DashboardRecentActivity class="h-full" />
                        </template>

                        <template v-else-if="element.id === 'upcomingWorkouts'">
                          <DashboardUpcomingWorkouts class="h-full" />
                        </template>

                        <template v-else-if="element.id === 'dataSyncStatus'">
                          <DashboardDataSyncStatus class="h-full" />
                        </template>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Dashboard Customizer Slideover -->
              <DashboardLayoutCustomizer 
                v-model:open="isEditMode" 
                :layout="dashboardLayout" 
                @update="handleLayoutUpdate" 
              />

              <!-- Ask Coach Floating Button -->"""

content = re.sub(grid_regex, new_grid, content, flags=re.DOTALL)

# Update DEFAULT_DASHBOARD_LAYOUT to remove reviewFeedback and coachFeedback
default_layout_regex = r'const DEFAULT_DASHBOARD_LAYOUT = \[.*?\]'
new_default_layout = """const DEFAULT_DASHBOARD_LAYOUT = [
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
  ]"""
content = re.sub(default_layout_regex, new_default_layout, content, flags=re.DOTALL)

# Add handleLayoutUpdate function
func_regex = r'function saveLayout\(\) \{'
new_func = """function handleLayoutUpdate(newLayout: any[]) {
    dashboardLayout.value = newLayout
    saveLayout()
  }

  function saveLayout() {"""
content = content.replace('function saveLayout() {', new_func)

# Fix the deprecated watch to remove reviewFeedback
watch_regex = r"const deprecatedIds = \['coachFeedback', 'athleteProfile'\];"
content = content.replace(watch_regex, "const deprecatedIds = ['coachFeedback', 'athleteProfile', 'reviewFeedback'];")

# Update 'Done Editing' text
content = content.replace("{{ isEditMode ? 'Done Editing' : 'Edit Layout' }}", "{{ isEditMode ? 'Done Editing' : 'Customize Layout' }}")
# Remove toggleEditMode's saveLayout call since we save from the customizer
content = content.replace("""    function toggleEditMode() {
      isEditMode.value = !isEditMode.value
      if (!isEditMode.value) {
        saveLayout()
      }
    }""", """    function toggleEditMode() {
      isEditMode.value = true
    }""")


with open('app/pages/dashboard.vue', 'w', encoding='utf-8') as f:
    f.write(content)
