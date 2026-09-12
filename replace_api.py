import os
import re

for filepath in ['d:/coach/app/pages/apply/unlock.vue', 'd:/coach/app/pages/apply/unleash.vue']:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    tier = 'UNLOCK' if 'unlock' in filepath else 'UNLEASH'
    content = re.sub(r'await \("/api/apply/submit"', f'await $fetch("/api/apply/submit"', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
