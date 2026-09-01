import re

with open('app/components/dashboard/AthleteProfileCard.vue', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('userStore.user?.maxHr', 'userStore.profile?.maxHr')
c = c.replace('userStore.user?.restingHr', 'userStore.profile?.restingHr')
c = c.replace('userStore.user?.lthr', 'userStore.profile?.lthr')
c = c.replace('userStore.user?.weight', 'userStore.profile?.weight')

with open('app/components/dashboard/AthleteProfileCard.vue', 'w', encoding='utf-8') as f:
    f.write(c)
