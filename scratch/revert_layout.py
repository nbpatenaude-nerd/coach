import re

with open('app/pages/dashboard.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Customize Layout Button
button_pattern = r'''\s*<UButton\s*v-if="canUseDashboardActions"\s*:color="isEditMode \? 'primary' : 'neutral'"\s*:variant="isEditMode \? 'solid' : 'ghost'"\s*icon="i-heroicons-squares-2x2"\s*class="hidden sm:inline-flex font-bold text-xs"\s*@click="toggleEditMode"\s*>\s*\{\{ isEditMode \? 'Done Editing' : 'Customize Layout' \}\}\s*</UButton>'''
content = re.sub(button_pattern, '', content, count=1)

# 2. Replace grid with static grid
grid_start = content.find('<!-- Draggable Dashboard Grid (Rendered statically, customized in Slideover) -->')
grid_end = content.find('<!-- App Info Footer -->')

if grid_start != -1 and grid_end != -1:
    static_grid = '''<!-- Static Dashboard Grid -->
              <div v-if="hasLoadedDashboardWidgets" class="relative">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 items-start grid-flow-dense">
                  
                  <DashboardAthleteProfileCard section="profile" class="col-span-1 lg:col-span-1 h-full" />
                  <DashboardTrainingRecommendationCard
                    class="col-span-1 md:col-span-2 lg:col-span-2 h-full"
                    @open-details="openRecommendationModal"
                    @open-checkin="openCheckinModal"
                  />
                  
                  <DashboardAthleteProfileCard section="trainingLoad" class="col-span-1 lg:col-span-1 h-full" />
                  <DashboardAthleteProfileCard section="corePerformance" class="col-span-1 lg:col-span-1 h-full" />
                  <DashboardAthleteProfileCard section="recentWellness" class="col-span-1 lg:col-span-1 h-full" />

                  <DashboardMonthlyComparisonCard v-if="canUseDashboardActions" class="col-span-1 md:col-span-2 lg:col-span-2 h-full" />
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
                    <div v-else-if="recommendationStore.todayRecommendation?.analysisJson?.recovery_analysis">
                      <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sleep: {{ recommendationStore.todayRecommendation.analysisJson.recovery_analysis.sleep_quality }} - 
                        HRV: {{ recommendationStore.todayRecommendation.analysisJson.recovery_analysis.hrv_trend }}
                      </p>
                      <p class="text-xs text-gray-500 mt-2 italic">
                        {{ recommendationStore.todayRecommendation.analysisJson.recovery_analysis.coach_note }}
                      </p>
                    </div>
                    <div v-else>
                      <p class="text-sm text-gray-500">Recovery algorithms are analyzing your sleep data.</p>
                    </div>
                  </UCard>
                  
                  <UCard class="col-span-1 lg:col-span-1 h-full flex flex-col">
                    <h3 class="font-bold mb-1">Glycogen Fuel Tank</h3>
                    <p class="text-sm text-gray-500">Estimating muscle glycogen depletion based on recent training volume.</p>
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

                  <DashboardRecentActivityCard class="col-span-1 md:col-span-2 lg:col-span-2 h-full" />
                  
                  <UCard class="col-span-1 lg:col-span-1 h-full flex flex-col" :ui="{ root: 'rounded-none sm:rounded-lg shadow-none sm:shadow', body: 'p-4 sm:p-6' }">
                    <template #header>
                      <div class="flex items-center justify-between">
                        <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
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
                    <div v-else-if="upcomingWorkoutsError" class="text-sm text-red-500 dark:text-red-400 py-4 text-center">
                      {{ upcomingWorkoutsError }}
                    </div>
                    <div v-else-if="upcomingWorkouts.length === 0" class="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                      {{ t('upcoming_workouts_empty') }}
                    </div>
                    <div v-else class="space-y-1">
                      <button
                        v-for="workout in upcomingWorkouts"
                        :key="workout.id"
                        class="w-full text-left flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                        @click="handleUpcomingWorkoutClick(workout.id)"
                      >
                        <div class="flex flex-col items-center justify-center min-w-[3rem] p-1.5 rounded bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                          <span class="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{{ formatDayShort(workout.scheduledDate) }}</span>
                          <span class="text-lg font-black text-gray-700 dark:text-gray-300 leading-none">{{ formatDateDay(workout.scheduledDate) }}</span>
                        </div>
                        <div class="flex-1 min-w-0 py-1">
                          <p class="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                            {{ workout.name }}
                          </p>
                          <div class="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                            <span class="capitalize">{{ workout.sportType }}</span>
                            <span v-if="workout.duration" class="flex items-center gap-1">
                              <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                              {{ workout.duration }}m
                            </span>
                            <span v-if="workout.tss" class="flex items-center gap-1">
                              <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                              {{ workout.tss }} TSS
                            </span>
                          </div>
                        </div>
                        <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-3" />
                      </button>
                    </div>
                  </UCard>
                  
                  <DashboardDataSyncStatus class="col-span-1 lg:col-span-1 h-full" />
                </div>
              </div>
              
              <!-- App Info Footer -->'''
    content = content[:grid_start] + static_grid + content[grid_end + len('<!-- App Info Footer -->'):]

# 3. Remove script vars
script_start = content.find('const isEditMode = ref(false)')
script_end = content.find('const upcomingWorkouts = ref<any[]>([])')

if script_start != -1 and script_end != -1:
    content = content[:script_start] + content[script_end:]

# 4. Remove DEFAULT_DASHBOARD_LAYOUT
default_layout_start = content.find('const DEFAULT_DASHBOARD_LAYOUT = [')
if default_layout_start != -1:
    default_layout_end = content.find(']', default_layout_start) + 1
    content = content[:default_layout_start] + content[default_layout_end:]

with open('app/pages/dashboard.vue', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
