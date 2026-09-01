import re

# 1. ZoneUpdatesModal.vue
with open('app/components/workouts/ZoneUpdatesModal.vue', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace(':ui="{ ring: \'\', divide: \'divide-y divide-gray-100 dark:divide-gray-800\' }"', '')
c = c.replace('color="gray"', 'color="neutral"')
c = c.replace('@click="isOpen = false"', '@click="() => { isOpen = false }"')
c = c.replace('const existingSettings = userStore.user?.sportSettings || []', 'const existingSettings = userStore.profile?.sportSettings || []')
c = c.replace('color: \'green\'', 'color: \'success\'')
c = c.replace('color: \'red\'', 'color: \'error\'')
with open('app/components/workouts/ZoneUpdatesModal.vue', 'w', encoding='utf-8') as f:
    f.write(c)

# 2. useLivePricing.ts
with open('app/composables/useLivePricing.ts', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace("tier: 'supporter' | 'pro'", 'tier: PricingTier')
c = c.replace("interval: 'monthly' | 'annual'", 'interval: BillingInterval')
c = c.replace("priceFor(plan, 'monthly', currency)", "priceFor(plan, '1-phase', currency)")
c = c.replace("priceFor(plan, 'annual', currency)", "priceFor(plan, '12-phase', currency)")
c = c.replace("findPrice(plan, 'monthly', currency)", "findPrice(plan, '1-phase', currency)")
c = c.replace("findPrice(plan, 'annual', currency)", "findPrice(plan, '12-phase', currency)")
with open('app/composables/useLivePricing.ts', 'w', encoding='utf-8') as f:
    f.write(c)

# 3. shared/quota-paywall.ts
with open('shared/quota-paywall.ts', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace("export function resolveRecommendedUpgradeTier(subscriptionTier: SubscriptionTier = 'FREE'): string | undefined {", "export function resolveRecommendedUpgradeTier(subscriptionTier: SubscriptionTier = 'FREE'): PricingTier | undefined {")
with open('shared/quota-paywall.ts', 'w', encoding='utf-8') as f:
    f.write(c)

# 4. WorkoutReceived.vue
with open('app/emails/WorkoutReceived.vue', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('defineProps<{', 'const props = defineProps<{')
c = c.replace("const resolvedSiteUrl = siteUrl || 'https://journeyendurance.com'", "const resolvedSiteUrl = props.siteUrl || 'https://journeyendurance.com'")
c = c.replace("const resolvedLogoUrl = logoUrl || 'https://journeyendurance.com/icon.png'", "const resolvedLogoUrl = props.logoUrl || 'https://journeyendurance.com/icon.png'")
with open('app/emails/WorkoutReceived.vue', 'w', encoding='utf-8') as f:
    f.write(c)

# 5. admin/cron.vue and admin/issues/index.vue
with open('app/pages/admin/issues/index.vue', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace("import type { BugStatus } from '@prisma/client'", "import type { BugStatus } from '~~/server/utils/generated-prisma/client'")
with open('app/pages/admin/issues/index.vue', 'w', encoding='utf-8') as f:
    f.write(c)

with open('app/pages/admin/cron.vue', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('@click="refresh"', '@click="() => { refresh() }"')
c = c.replace('@click="runTask(task.taskName)"', '@click="() => { runTask(task.taskName) }"')
with open('app/pages/admin/cron.vue', 'w', encoding='utf-8') as f:
    f.write(c)

# 6. check-in-analysis.vue
with open('app/pages/coaching/check-in-analysis.vue', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace(':chart-data="chartData"', ':data="chartData"')
c = c.replace(':chart-options="chartOptions"', ':options="chartOptions"')
with open('app/pages/coaching/check-in-analysis.vue', 'w', encoding='utf-8') as f:
    f.write(c)
