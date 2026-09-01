import re

with open('app/components/dashboard/AthleteProfileCard.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the icon and title based on section
header_regex = r'<UIcon name="i-heroicons-user-circle" class="w-5 h-5 text-primary-500" />\s*<h3 class="font-bold text-sm tracking-tight uppercase">\s*\{\{ t\(\'athlete_profile_header\'\) \}\}\s*</h3>'

new_header = """<UIcon v-if="section === 'all' || section === 'profile'" name="i-heroicons-user-circle" class="w-5 h-5 text-primary-500" />
          <h3 v-if="section === 'all' || section === 'profile'" class="font-bold text-sm tracking-tight uppercase">
            {{ t('athlete_profile_header') }}
          </h3>
          <UIcon v-if="section === 'trainingLoad'" name="i-heroicons-chart-bar" class="w-5 h-5 text-purple-500" />
          <h3 v-if="section === 'trainingLoad'" class="font-bold text-sm tracking-tight uppercase">
            Training Load & Form
          </h3>
          <UIcon v-if="section === 'corePerformance'" name="i-heroicons-bolt" class="w-5 h-5 text-amber-500" />
          <h3 v-if="section === 'corePerformance'" class="font-bold text-sm tracking-tight uppercase">
            Core Performance
          </h3>
          <UIcon v-if="section === 'recentWellness'" name="i-heroicons-heart" class="w-5 h-5 text-indigo-500" />
          <h3 v-if="section === 'recentWellness'" class="font-bold text-sm tracking-tight uppercase">
            Recent Wellness
          </h3>"""

content = re.sub(header_regex, new_header, content)

# Also fix the inner padding issues and remove the "ATHLETE PROFILE" subheader if it's rendered as the main header
profile_subheader_regex = r'<p\s*class="text-\[10px\] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest"\s*>\s*\{\{ t\(\'athlete_profile_header\'\) \}\}\s*</p>'
content = re.sub(profile_subheader_regex, '', content)

training_subheader_regex = r'<p\s*class="text-\[10px\] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest"\s*>\s*Training Load & Form\s*</p>'
content = re.sub(training_subheader_regex, '', content)

perf_subheader_regex = r'<p\s*class="text-\[10px\] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest"\s*>\s*Core Performance\s*</p>'
content = re.sub(perf_subheader_regex, '', content)

well_subheader_regex = r'<p\s*class="text-\[10px\] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest"\s*>\s*Recent Wellness\s*</p>'
content = re.sub(well_subheader_regex, '', content)

with open('app/components/dashboard/AthleteProfileCard.vue', 'w', encoding='utf-8') as f:
    f.write(content)
