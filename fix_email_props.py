import re

with open('app/emails/WorkoutReceived.vue', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("const siteUrl = 'https://journey.coach'\n  const logoUrl = 'https://journey.coach/icon.png'\n  ", "")
c = c.replace("typeof siteUrl !== 'undefined' ? siteUrl", "typeof props.siteUrl !== 'undefined' ? props.siteUrl")
c = c.replace("typeof logoUrl !== 'undefined' ? logoUrl", "typeof props.logoUrl !== 'undefined' ? props.logoUrl")

with open('app/emails/WorkoutReceived.vue', 'w', encoding='utf-8') as f:
    f.write(c)
