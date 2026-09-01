import re

with open('app/pages/dashboard.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<template v-else-if="element.id === \'athleteProfileBasic\'">', '<template v-if="element.id === \'athleteProfileBasic\'">')

with open('app/pages/dashboard.vue', 'w', encoding='utf-8') as f:
    f.write(content)
