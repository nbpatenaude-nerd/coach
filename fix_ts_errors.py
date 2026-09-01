import re

def process_file(filepath, replacements):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            c = f.read()
        for old, new in replacements:
            c = c.replace(old, new)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(c)
    except FileNotFoundError:
        pass

# AiAutomationSettings.vue
process_file('app/components/settings/AiAutomationSettings.vue', [
    ('\"supporter\"', '\"SUPPORTER\"'),
    ('\"pro\"', '\"PRO\"'),
    ('hasEntitlement(userStore.user, [\'SUPPORTER\', \'PRO\'])', 'hasEntitlement(userStore.user, [\'UNCOVER\', \'UNLOCK\', \'UNLEASH\'])')
])

# BillingPlans.vue
process_file('app/components/settings/BillingPlans.vue', [
    ('interval === \'monthly\'', 'interval === \"MONTHLY\"'),
    ('interval === \'annual\'', 'interval === \"ANNUAL\"'),
    ('interval = \'monthly\'', 'interval = \"MONTHLY\"'),
    ('interval = \'annual\'', 'interval = \"ANNUAL\"')
])

# UpgradeModal.vue
process_file('app/components/UpgradeModal.vue', [
    ('interval === \'monthly\'', 'interval === \"MONTHLY\"'),
    ('interval === \'annual\'', 'interval === \"ANNUAL\"'),
    ('interval = \'monthly\'', 'interval = \"MONTHLY\"'),
    ('interval = \'annual\'', 'interval = \"ANNUAL\"')
])

# useQuotaPaywall.ts
process_file('app/composables/useQuotaPaywall.ts', [
    ('recommendedTier: opts.recommendedTier', 'recommendedTier: opts.recommendedTier as any')
])

# useUpgradeModal.ts
process_file('app/composables/useUpgradeModal.ts', [
    ('recommendedTier: string', 'recommendedTier: any')
])

# crm.vue
process_file('app/pages/coaching/crm.vue', [
    ('status: athlete.status', 'status: athlete.status || null'),
    ('athlete.user?.maxHr', 'athlete.user?.maxHr || 0'),
    ('athlete.user?.restingHr', 'athlete.user?.restingHr || 0')
])

# WorkoutReceived.vue
process_file('app/emails/WorkoutReceived.vue', [
    ('siteUrl', '\\"https://journey.coach\\"'),
    ('logoUrl', '\\"https://journey.coach/logo.png\\"')
])

