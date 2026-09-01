import re

with open('app/pages/dashboard.vue', 'r', encoding='utf-8') as f:
    content = f.read()

new_layout = """  const DEFAULT_DASHBOARD_LAYOUT = [
    { id: 'reviewFeedback', class: 'col-span-1 md:col-span-2 lg:col-span-3' },
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

content = re.sub(r'const DEFAULT_DASHBOARD_LAYOUT = \[[^\]]*\]', new_layout, content, flags=re.DOTALL)

# Add Size Toggle in Edit Mode Overlay
edit_mode_overlay = """                      <div
                        v-if="isEditMode"
                        class="absolute inset-0 z-10 flex items-start justify-end p-2 pointer-events-none rounded-xl"
                      >
                        <div
                          class="bg-white dark:bg-gray-800 shadow-sm rounded border border-gray-200 dark:border-gray-700 p-1 flex items-center gap-1 transition-opacity pointer-events-auto"
                        >
                          <USelect
                            v-model="element.class"
                            :options="[
                              { label: '1/3 Width', value: 'col-span-1 lg:col-span-1' },
                              { label: '2/3 Width', value: 'col-span-1 md:col-span-2 lg:col-span-2' },
                              { label: 'Full Width', value: 'col-span-1 md:col-span-2 lg:col-span-3' }
                            ]"
                            size="2xs"
                            variant="none"
                            class="bg-transparent text-xs"
                            @change="saveLayout"
                          />
                          <UIcon
                            name="i-heroicons-arrows-pointing-out"
                            class="w-5 h-5 text-gray-500 ml-2"
                          />
                        </div>
                      </div>"""

content = re.sub(
    r'<div\s+v-if="isEditMode"\s+class="absolute inset-0 z-10 flex items-start justify-end p-2 pointer-events-none rounded-xl"\s*>\s*<div\s+class="bg-white dark:bg-gray-800 shadow-sm rounded border border-gray-200 dark:border-gray-700 p-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"\s*>\s*<UIcon\s+name="i-heroicons-arrows-pointing-out"\s+class="w-5 h-5 text-gray-500"\s*/>\s*</div>\s*</div>',
    edit_mode_overlay,
    content,
    flags=re.DOTALL
)

# Update the template blocks
old_coach_feedback = """                        <template v-if="element.id === 'coachFeedback'">
                          <DashboardCoachFeedback class="h-full" />
                        </template>"""

new_templates = """                        <template v-if="element.id === 'reviewFeedback'">
                          <DashboardReviewFeedback class="h-full" />
                        </template>
                        <template v-else-if="element.id === 'athleteProfileBasic'">
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
                        </template>"""

content = content.replace(old_coach_feedback, new_templates)

# We also need to remove <DashboardCheckIn /> from above
content = content.replace('<!-- Weekly Check-In (For All Athletes) -->\\n              <DashboardCheckIn />', '')

# Remove AthleteProfileCard if it exists as 'athleteProfile'
content = content.replace('''                        <template v-else-if="element.id === 'athleteProfile'">
                          <DashboardAthleteProfileCard class="h-full" />
                        </template>''', '')
content = content.replace('''                        <template v-else-if="element.id === 'athleteProfile'">
                          <AthleteProfileCard class="h-full" />
                        </template>''', '')


with open('app/pages/dashboard.vue', 'w', encoding='utf-8') as f:
    f.write(content)
