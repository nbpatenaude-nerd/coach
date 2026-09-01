import re

with open('app/components/dashboard/DashboardLayoutCustomizer.vue', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('<USlideover', '<USlideover')
c = c.replace('title="Customize Dashboard"\n    description="Drag widgets to reorder them or change their sizes."', '')
c = c.replace('>\n    <template #header>', '>\n    <UCard class="flex flex-col flex-1" :ui="{ body: { base: \'flex-1\' }, ring: \'\', divide: \'divide-y divide-gray-100 dark:divide-gray-800\' }">\n      <template #header>')
c = c.replace('</USlideover>', '    </UCard>\n  </USlideover>')

with open('app/components/dashboard/DashboardLayoutCustomizer.vue', 'w', encoding='utf-8') as f:
    f.write(c)
