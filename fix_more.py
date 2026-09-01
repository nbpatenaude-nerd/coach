import re

with open('app/pages/coaching/crm.vue', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('v-for="stage in activePipeline.stages"', 'v-for="stage in activePipeline?.stages || []"')
c = c.replace('grouped[pipeline.stages[0].id].push(a)', 'if (pipeline.stages && pipeline.stages.length > 0) { const defaultStageId = pipeline.stages[0].id; if (grouped[defaultStageId]) { grouped[defaultStageId].push(a); } }')

c = c.replace('const athlete = athletes.value.find((a: CrmAthlete) => a.id === athleteId)', 'const athlete = athletes.value?.find((a: CrmAthlete) => a.id === athleteId)')

with open('app/pages/coaching/crm.vue', 'w', encoding='utf-8') as f:
    f.write(c)

with open('app/pages/workouts/upload-csv.vue', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('color="red"', 'color="error"')
c = c.replace('color="green"', 'color="success"')
with open('app/pages/workouts/upload-csv.vue', 'w', encoding='utf-8') as f:
    f.write(c)

with open('app/pages/library/plans/[id]/architect.vue', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('@click="isOpen = false"', '@click="() => { isOpen = false }"')
with open('app/pages/library/plans/[id]/architect.vue', 'w', encoding='utf-8') as f:
    f.write(c)
