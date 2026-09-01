import re

with open('app/pages/dashboard.vue', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("const deprecatedIds = ['coachFeedback', 'athleteProfile']", "const deprecatedIds = ['coachFeedback', 'athleteProfile', 'reviewFeedback']")

with open('app/pages/dashboard.vue', 'w', encoding='utf-8') as f:
    f.write(c)
