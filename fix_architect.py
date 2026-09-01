import re

with open('app/pages/library/plans/[id]/architect.vue', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('@click="isAiModalOpen = true"', '@click="() => { isAiModalOpen = true }"')

with open('app/pages/library/plans/[id]/architect.vue', 'w', encoding='utf-8') as f:
    f.write(c)
