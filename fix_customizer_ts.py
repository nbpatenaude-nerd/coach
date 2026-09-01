import re

with open('app/components/dashboard/DashboardLayoutCustomizer.vue', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(':ui="{ body: { base: \'flex-1\' }, ring: \'\', divide: \'divide-y divide-gray-100 dark:divide-gray-800\' }"', '')
c = c.replace('@click="isOpen = false"', '@click="() => { isOpen = false }"')

with open('app/components/dashboard/DashboardLayoutCustomizer.vue', 'w', encoding='utf-8') as f:
    f.write(c)
