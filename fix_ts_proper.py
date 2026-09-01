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

process_file('app/components/settings/AiAutomationSettings.vue', [
    ('"supporter"', '"SUPPORTER"'),
    ('"pro"', '"PRO"'),
    ("hasEntitlement(userStore.user, ['SUPPORTER', 'PRO'])", "hasEntitlement(userStore.user, ['UNCOVER', 'UNLOCK', 'UNLEASH'])")
])

process_file('app/components/settings/BillingPlans.vue', [
    ("interval === 'monthly'", "interval === 'MONTHLY'"),
    ("interval === 'annual'", "interval === 'ANNUAL'"),
    ("interval = 'monthly'", "interval = 'MONTHLY'"),
    ("interval = 'annual'", "interval = 'ANNUAL'")
])

process_file('app/components/UpgradeModal.vue', [
    ("interval === 'monthly'", "interval === 'MONTHLY'"),
    ("interval === 'annual'", "interval === 'ANNUAL'"),
    ("interval = 'monthly'", "interval = 'MONTHLY'"),
    ("interval = 'annual'", "interval = 'ANNUAL'")
])

process_file('app/composables/useQuotaPaywall.ts', [
    ('recommendedTier: opts.recommendedTier', 'recommendedTier: opts.recommendedTier as any')
])

process_file('app/composables/useUpgradeModal.ts', [
    ('recommendedTier: string', 'recommendedTier: any')
])

process_file('app/pages/coaching/crm.vue', [
    ('status: athlete.status', 'status: athlete.status || null'),
    ('athlete.user?.maxHr', 'athlete.user?.maxHr || 0'),
    ('athlete.user?.restingHr', 'athlete.user?.restingHr || 0')
])
