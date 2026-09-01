import re

with open('app/components/dashboard/DashboardLayoutCustomizer.vue', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("import draggable from 'vuedraggable'\n", "")

with open('app/components/dashboard/DashboardLayoutCustomizer.vue', 'w', encoding='utf-8') as f:
    f.write(c)
