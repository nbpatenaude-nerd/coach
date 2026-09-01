import re

def process_file(filepath, replacements):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            c = f.read()
        for old, new in replacements:
            c = c.replace(old, new)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(c)
    except Exception as e:
        pass

# 1. RoadOfTrialsChart
process_file('app/components/RoadOfTrialsChart.vue', [
    ('color="white"', 'color="neutral"'),
    ('color="gray"', 'color="neutral"'),
    ('@click="refresh"', '@click="() => { refresh() }"')
])

# 2. AiAutomationSettings
process_file('app/components/settings/AiAutomationSettings.vue', [
    ("recommendedTier: 'supporter'", "recommendedTier: 'UNCOVER'"),
    ("recommendedTier: 'pro'", "recommendedTier: 'UNLOCK'"),
    ("canUseTier('SUPPORTER')", "canUseTier('UNCOVER')"),
    ("tier: 'SUPPORTER' | 'PRO'", "tier: 'UNCOVER' | 'UNLOCK' | 'UNLEASH'"),
    ("['SUPPORTER', 'PRO']", "['UNCOVER', 'UNLOCK', 'UNLEASH']")
])

# 3. AiCoachSettings
process_file('app/components/settings/AiCoachSettings.vue', [
    ("tone: userStore.user?.aiCoachSettings?.tone || 'coach',", "tone: (userStore.user?.aiCoachSettings?.tone as any) || 'coach',"),
    ("verbosity: userStore.user?.aiCoachSettings?.verbosity || 'normal'", "verbosity: (userStore.user?.aiCoachSettings?.verbosity as any) || 'normal'")
])

# 4. BillingPlans
process_file('app/components/settings/BillingPlans.vue', [
    ("interval === 'monthly'", "interval === '1-phase'"),
    ("interval === 'annual'", "interval === '12-phase'"),
    ("interval = 'monthly'", "interval = '1-phase'"),
    ("interval = 'annual'", "interval = '12-phase'"),
    ("annualPrice", "price"),
    ("monthlyPrice", "price")
])

# 5. UpgradeModal
process_file('app/components/UpgradeModal.vue', [
    ("interval === 'monthly'", "interval === '1-phase'"),
    ("interval === 'annual'", "interval === '12-phase'"),
    ("interval = 'monthly'", "interval = '1-phase'"),
    ("interval = 'annual'", "interval = '12-phase'"),
    ("interval === 'ANNUAL'", "interval === '12-phase'"),
    ("annualPrice", "price"),
    ("monthlyPrice", "price")
])

# 6. WorkoutStepRow
process_file('app/components/workouts/planned/WorkoutStepRow.vue', [
    ('color="gray"', 'color="neutral"'),
    ('size="2xs"', 'size="xs"')
])

# 7 & 8. composables
process_file('app/composables/useQuotaPaywall.ts', [
    ('recommendedTier: opts.recommendedTier', 'recommendedTier: opts.recommendedTier as any')
])
process_file('app/composables/useUpgradeModal.ts', [
    ('recommendedTier: string', 'recommendedTier: any')
])

# 9 & 10. admin
process_file('app/pages/admin/issues/[id].vue', [
    ("=== 'PRO'", "=== 'UNLOCK'")
])
process_file('app/pages/admin/stats/llm/users.vue', [
    ("=== 'PRO'", "=== 'UNLOCK'"),
    ("=== 'SUPPORTER'", "=== 'UNCOVER'")
])

# 11. crm
process_file('app/pages/coaching/crm.vue', [
    ('status: athlete.status,', 'status: athlete.status || null,'),
    ('athlete.user?.maxHr,', 'athlete.user?.maxHr || 0,'),
    ('athlete.user?.restingHr', 'athlete.user?.restingHr || 0')
])

# 12. dashboard
process_file('app/pages/dashboard.vue', [
    (':weight="userStore.user?.weight"', ':weight="(userStore.user as any)?.weight"')
])

