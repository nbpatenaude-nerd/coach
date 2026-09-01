import re
with open('app/pages/admin/subscriptions.vue', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace("user.subscriptionTier === 'PRO'", "(user.subscriptionTier as any) === 'PRO'")
with open('app/pages/admin/subscriptions.vue', 'w', encoding='utf-8') as f:
    f.write(c)

with open('app/pages/admin/stats/llm/users.vue', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace("u.subscriptionTier === 'PRO'", "(u.subscriptionTier as any) === 'PRO'")
c = c.replace("u.subscriptionTier === 'SUPPORTER'", "(u.subscriptionTier as any) === 'SUPPORTER'")
with open('app/pages/admin/stats/llm/users.vue', 'w', encoding='utf-8') as f:
    f.write(c)
    
with open('app/pages/admin/issues/[id].vue', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace("issue.reporter.subscriptionTier === 'PRO'", "(issue.reporter.subscriptionTier as any) === 'PRO'")
with open('app/pages/admin/issues/[id].vue', 'w', encoding='utf-8') as f:
    f.write(c)

with open('app/pages/settings/ai.vue', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace("userStore.user.isCoach", "(userStore.user as any).isCoach")
with open('app/pages/settings/ai.vue', 'w', encoding='utf-8') as f:
    f.write(c)
