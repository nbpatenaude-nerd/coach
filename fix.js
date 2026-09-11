const fs = require('fs')
let content = fs.readFileSync('app/components/workouts/WorkoutRunChart.vue', 'utf8')
content = content.replace(/<div[^>]*v-if="[^"]*getStepBpmLabel[^"]*"[^>]*>[\s\S]*?<\/div>/g, '')
fs.writeFileSync('app/components/workouts/WorkoutRunChart.vue', content)
