import re

with open('app/emails/WorkoutReceived.vue', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("const resolvedSiteUrl", "const siteUrl = 'https://journey.coach'\n  const logoUrl = 'https://journey.coach/icon.png'\n  const resolvedSiteUrl")

with open('app/emails/WorkoutReceived.vue', 'w', encoding='utf-8') as f:
    f.write(c)
