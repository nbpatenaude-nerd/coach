import re

with open('app/pages/dashboard.vue', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('<!-- Weekly Check-In (For All Athletes) -->\n              <DashboardCheckIn />', '')

with open('app/pages/dashboard.vue', 'w', encoding='utf-8') as f:
    f.write(c)
