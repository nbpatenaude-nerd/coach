import os

def fix_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for old, new in replacements:
        content = content.replace(old, new)
        
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

# AiAutomationSettings.vue
fix_file('app/components/settings/AiAutomationSettings.vue', [
    ("'UNCOVER'", "'uncover'"),
    ("'UNLOCK'", "'unlock'"),
    ("'UNLEASH'", "'unleash'"),
])

# TrophyCase.vue
fix_file('app/components/profile/TrophyCase.vue', [
    ("userStore.user.entitlements.", "userStore.user?.entitlements?."),
    ("userStore.user.", "userStore.user?."),
])

# RoadOfTrialsChart.vue
fix_file('app/components/RoadOfTrialsChart.vue', [
    ("color: 'gray'", "color: 'neutral'"),
])

# BillingPlans.vue
fix_file('app/components/settings/BillingPlans.vue', [
    ("formatPrice(priceFor(plan, billingInterval.value === 'monthly' ? '1-phase' : '12-phase', currency) as number, currency)", "formatPrice(priceFor(plan, billingInterval.value === 'monthly' ? '1-phase' : '12-phase', currency) || 0, currency)"),
    ("formatPrice(priceFor(plan, billingInterval === 'monthly' ? '1-phase' : '12-phase', currency) as number, currency)", "formatPrice(priceFor(plan, billingInterval === 'monthly' ? '1-phase' : '12-phase', currency) || 0, currency)"),
    ("current.interval === billingInterval.value", "current.interval === (billingInterval.value === 'monthly' ? '1-phase' : '12-phase')"),
])

# QuotaPaywall and UpgradeModal
fix_file('app/composables/useQuotaPaywall.ts', [
    ("recommendedTier: string | undefined", "recommendedTier: any"),
])
fix_file('app/composables/useUpgradeModal.ts', [
    ("recommendedTier: string | undefined", "recommendedTier: any"),
])

# crm.vue
fix_file('app/pages/coaching/crm.vue', [
    ("grouped[deal.stageId].push", "grouped[deal.stageId]?.push"),
])

# community-calendar.vue
fix_file('app/pages/community-calendar.vue', [
    ('@click="(e) => e.stopPropagation()"', '@click.stop=""'),
    ('@click="e => e.stopPropagation()"', '@click.stop=""'),
    ('@click.stop="() => {}"', '@click.stop=""'),
])

# daily-checkins.vue
fix_file('app/pages/daily-checkins.vue', [
    ('@click="(e) => e.stopPropagation()"', '@click.stop=""'),
])

# dashboard.vue
fix_file('app/pages/dashboard.vue', [
    ('color="yellow"', 'color="warning"'),
])

# events/[id].vue
fix_file('app/pages/events/[id].vue', [
    ("ring: '',", ""),
    ('color="gray"', 'color="neutral"'),
    ("color='gray'", "color='neutral'"),
    ('@click="(e) => e.stopPropagation()"', '@click.stop=""'),
    ('@click="e => e.stopPropagation()"', '@click.stop=""'),
])

# library/exercises/index.vue
fix_file('app/pages/library/exercises/index.vue', [
    ('@click="(e) => e.stopPropagation()"', '@click.stop=""'),
    ('@click="e => e.stopPropagation()"', '@click.stop=""'),
])

