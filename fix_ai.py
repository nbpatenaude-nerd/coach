import re

with open('app/pages/settings/ai.vue', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('userStore.user?.isCoach', '(userStore.user as any)?.isCoach')

with open('app/pages/settings/ai.vue', 'w', encoding='utf-8') as f:
    f.write(c)
