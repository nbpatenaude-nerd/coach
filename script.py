import re
with open('app/components/dashboard/AthleteProfileCard.vue', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('const userStore = useUserStore()', '''const props = defineProps<{ section?: \\'all\\' | \\'profile\\' | \\'trainingLoad\\' | \\'corePerformance\\' | \\'recentWellness\\' }>()\n  const section = computed(() => props.section || \\'all\\')\n  const userStore = useUserStore()''')

c = c.replace('<!-- Profile Info Card - Clickable -->', '''<!-- Profile Info Card - Clickable -->\n      <div v-if=\"section === 'all' || section === 'profile'\">''')

c = c.replace('<!-- Training Load & Form Section -->', '''</div>\n      <!-- Training Load & Form Section -->\n      <div v-if=\"section === 'all' || section === 'trainingLoad'\">''')

c = c.replace('<!-- Performance Section - Clickable -->', '''</div>\n      <!-- Performance Section - Clickable -->\n      <div v-if=\"section === 'all' || section === 'corePerformance'\">''')

c = c.replace('<!-- Wellness Section - Clickable -->', '''</div>\n      <!-- Wellness Section - Clickable -->\n      <div v-if=\"section === 'all' || section === 'recentWellness'\">''')

c = c.replace('<div v-if=\"showHydrationSection\"', '</div>\n      <div v-if=\"showHydrationSection\"')

with open('app/components/dashboard/AthleteProfileCard.vue', 'w', encoding='utf-8') as f:
    f.write(c)
