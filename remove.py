import re

with open('app/pages/dashboard.vue', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'<template v-else-if="element.id === \'athleteProfile\'">.*?<\/template>', '', content, flags=re.DOTALL)

with open('app/pages/dashboard.vue', 'w', encoding='utf-8') as f:
    f.write(content)
