import os
with open('d:/coach/app/layouts/home.vue', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if '<NuxtLink' in line and ('to="/library"' in line or 'to="/community"' in line):
        skip = True
        
    if skip:
        if '</NuxtLink' in line:
            skip = False
        continue
    
    new_lines.append(line)

with open('d:/coach/app/layouts/home.vue', 'w', encoding='utf-8') as f:
    f.write(''.join(new_lines))
