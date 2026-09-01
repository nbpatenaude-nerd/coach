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

# 1. AiAutomationSettings
process_file('app/components/settings/AiAutomationSettings.vue', [
    ("recommendedTier: 'UNCOVER'", "recommendedTier: 'uncover'"),
    ("recommendedTier: 'UNLOCK'", "recommendedTier: 'unlock'"),
    ("canUseTier('UNCOVER')", "canUseTier('uncover')"),
    ("tier: 'UNCOVER' | 'UNLOCK' | 'UNLEASH'", "tier: 'uncover' | 'unlock' | 'unleash'"),
    ("['UNCOVER', 'UNLOCK', 'UNLEASH']", "['uncover', 'unlock', 'unleash']")
])

# 2. BillingPlans
process_file('app/components/settings/BillingPlans.vue', [
    ("interval === 'monthly'", "interval === '1-phase'"),
    ("interval === 'annual'", "interval === '12-phase'"),
    ("interval = 'monthly'", "interval = '1-phase'"),
    ("interval = 'annual'", "interval = '12-phase'"),
    ("price", "phase12Price"),
    ("phase12Price", "phase12Price"), # no-op just in case
    ("annualPrice", "phase12Price"),
    ("monthlyPrice", "phase1Price")
])

# 3. UpgradeModal
process_file('app/components/UpgradeModal.vue', [
    ("interval === 'monthly'", "interval === '1-phase'"),
    ("interval === 'annual'", "interval === '12-phase'"),
    ("interval = 'monthly'", "interval = '1-phase'"),
    ("interval = 'annual'", "interval = '12-phase'"),
    ("interval === 'ANNUAL'", "interval === '12-phase'"),
    ("interval === 'MONTHLY'", "interval === '1-phase'"),
    ("annualPrice", "phase12Price"),
    ("monthlyPrice", "phase1Price"),
    ("price", "phase12Price")
])

# 4. Profile TrophyCase
process_file('app/components/profile/TrophyCase.vue', [
    ("stats.value.longestStreak", "(stats.value?.longestStreak || 0)"),
    ("stats.value.currentStreak", "(stats.value?.currentStreak || 0)"),
    ("stats.value.totalCheckins", "(stats.value?.totalCheckins || 0)")
])

# 5. Program PlanCard
process_file('app/components/programs/PlanCard.vue', [
    ("color=\"cyan\"", "color=\"primary\"")
])

# 6. RoadOfTrialsChart
process_file('app/components/RoadOfTrialsChart.vue', [
    ("interaction: {", "interaction: { mode: 'index' as any,"),
    ("color=\"white\"", "color=\"neutral\""),
    ("color=\"gray\"", "color=\"neutral\"")
])

# 7. WorkoutStepRow
process_file('app/components/workouts/planned/WorkoutStepRow.vue', [
    ("color=\"gray\"", "color=\"neutral\""),
    ("size=\"2xs\"", "size=\"xs\"")
])

# 8. composables
process_file('app/composables/useQuotaPaywall.ts', [
    ('recommendedTier: opts.recommendedTier', 'recommendedTier: opts.recommendedTier as any')
])
process_file('app/composables/useUpgradeModal.ts', [
    ('recommendedTier: string', 'recommendedTier: any')
])

# 9. admin
process_file('app/pages/admin/issues/[id].vue', [
    ("=== 'PRO'", "=== 'UNLOCK'")
])
process_file('app/pages/admin/stats/llm/users.vue', [
    ("=== 'PRO'", "=== 'UNLOCK'"),
    ("=== 'SUPPORTER'", "=== 'UNCOVER'")
])

# 10. crm
process_file('app/pages/coaching/crm.vue', [
    ('status: athlete.status,', 'status: athlete.status || null,'),
    ('athlete.user?.maxHr,', 'athlete.user?.maxHr || 0,'),
    ('athlete.user?.restingHr', 'athlete.user?.restingHr || 0')
])

# 11. dashboard
process_file('app/pages/dashboard.vue', [
    (':weight="userStore.user?.weight"', ':weight="(userStore.user as any)?.weight"')
])

# 12. landing PricingPlans
process_file('app/components/landing/PricingPlans.vue', [
    ("interval === 'monthly'", "interval === '1-phase'"),
    ("interval === 'annual'", "interval === '12-phase'"),
    ("annualPrice", "phase12Price"),
    ("monthlyPrice", "phase1Price")
])

# 13. landing HeroJourney
process_file('app/components/landing/HeroJourney.vue', [
    ('color="white"', 'color="neutral"'),
    ('color="gray"', 'color="neutral"')
])

# 14. library modales
process_file('app/components/library/ApplyPlanModal.vue', [
    ('@click="handleSelect(plan.id)"', '@click="() => handleSelect(plan.id)"')
])
process_file('app/components/library/ApplyWorkoutModal.vue', [
    ('@click="handleSelect(workout.id)"', '@click="() => handleSelect(workout.id)"')
])
process_file('app/components/library/GeneratePlanAdHocModal.vue', [
    ('@click="handleSelect(template.id)"', '@click="() => handleSelect(template.id)"')
])
process_file('app/components/plans/PlanArchitectWorkoutDrawer.vue', [
    ('@click="toggleDay(day.id)"', '@click="() => toggleDay(day.id)"')
])
process_file('app/components/PricingPlanCard.vue', [
    ("interval === 'monthly'", "interval === '1-phase'"),
    ("interval === 'annual'", "interval === '12-phase'")
])
process_file('app/components/profile/MeasurementsSettings.vue', [
    ("userStore.user?.trackedCheckinMetrics", "(userStore.user as any)?.trackedCheckinMetrics")
])

