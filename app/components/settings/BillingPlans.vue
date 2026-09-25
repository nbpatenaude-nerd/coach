<template>
  <div class="space-y-8">
    <div class="flex flex-wrap justify-center items-center gap-4">
      <div class="flex flex-col items-center gap-1.5">
        <span class="text-[9px] font-black uppercase tracking-widest text-gray-500">
          {{ t('billing.toggle_guild') }}
        </span>
        <div
          class="inline-flex items-center gap-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md p-1"
        >
          <button
            v-for="option in guildIntervalOptions"
            :key="option.value"
            :class="[
              'rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2',
              guildInterval === option.value
                ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20'
                : 'text-gray-400 hover:text-white'
            ]"
            @click="guildInterval = option.value"
          >
            {{ option.label }}
            <span
              v-if="option.value === 'annual' && guildInterval !== 'annual' && guildSavings"
              class="text-[9px] bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full border border-primary-500/20"
            >
              {{ t('billing.save_pct', { pct: guildSavings }) }}
            </span>
          </button>
        </div>
      </div>

      <div class="flex flex-col items-center gap-1.5">
        <span class="text-[9px] font-black uppercase tracking-widest text-gray-500">
          {{ t('billing.toggle_coaching') }}
        </span>
        <div
          class="inline-flex items-center gap-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md p-1"
        >
          <button
            v-for="option in phaseIntervalOptions"
            :key="option.value"
            :class="[
              'rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2',
              phaseInterval === option.value
                ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20'
                : 'text-gray-400 hover:text-white'
            ]"
            @click="phaseInterval = option.value"
          >
            {{ option.label }}
            <span
              v-if="option.value === '12-phase' && phaseInterval !== '12-phase' && coachingSavings"
              class="text-[9px] bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full border border-primary-500/20"
            >
              {{ t('billing.save_pct', { pct: coachingSavings }) }}
            </span>
          </button>
        </div>
      </div>

      <div
        class="inline-flex items-center gap-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md p-1"
      >
        <button
          :class="[
            'rounded-xl px-3.5 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
            currency === 'usd'
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-300'
          ]"
          @click="
            () => {
              void setCurrency('usd')
            }
          "
        >
          USD
        </button>
        <button
          :class="[
            'rounded-xl px-3.5 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
            currency === 'eur'
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-300'
          ]"
          @click="
            () => {
              void setCurrency('eur')
            }
          "
        >
          EUR
        </button>
      </div>
    </div>

    <div
      :class="[
        'grid grid-cols-1 lg:grid-cols-4 items-stretch max-w-360 mx-auto gap-5 xl:gap-6',
        props.conversionGoal === 'unleash' ? 'lg:grid-cols-[1fr_1fr_1.08fr_1fr]' : ''
      ]"
    >
      <div
        v-for="plan in displayedPlans"
        :key="plan.key"
        :class="[
          'flex flex-col relative overflow-hidden rounded-4xl p-6 sm:p-7 floating-card-base grain-overlay transition-all duration-500 group border-white/10',
          getCardClass(plan),
          getPlanOrderClass(plan),
          isPrimaryPlan(plan) ? 'shadow-2xl shadow-primary-500/10' : ''
        ]"
      >
        <div
          v-if="isPrimaryPlan(plan)"
          class="absolute inset-0 pointer-events-none ring-2 ring-primary-500/50 animate-pulse-border rounded-4xl"
        />

        <div
          v-if="getPlanBadge(plan)"
          class="absolute top-5 right-5 text-primary-500 text-[9px] font-black px-3 py-1 rounded-full border border-primary-500/20 bg-primary-500/5 uppercase tracking-widest"
        >
          {{ getPlanBadge(plan) }}
        </div>

        <div class="mb-6">
          <h3
            class="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-primary-500 transition-colors"
          >
            {{ t(`plan.${plan.key}.name`) }}
          </h3>

          <div class="flex items-baseline gap-2 font-athletic italic mb-1.5">
            <span class="font-black text-white leading-none text-5xl xl:text-[3.75rem]">
              {{ formatPrice(priceFor(plan, planInterval(plan), currency), currency) }}
            </span>
            <span
              class="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1"
            >
              {{ priceSuffix(plan) }}
            </span>
          </div>

          <div class="min-h-8">
            <template v-if="showsLongTermSavings(plan)">
              <div class="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">
                {{ formatPrice(monthlyEquivalent(plan, currency), currency) }} /
                {{ t('billing.per_month') }}
              </div>
              <div class="flex items-center gap-3">
                <span class="text-[10px] font-bold text-gray-600 line-through tracking-wider">
                  {{ formatPrice(priceFor(plan, '1-phase', currency), currency) }}
                  {{ plan.key === 'guild' ? '/mo' : '/phase' }}
                </span>
                <span
                  v-if="annualSavings(plan, currency)"
                  class="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/20"
                >
                  {{ t('billing.save_pct', { pct: annualSavings(plan, currency) }) }}
                </span>
              </div>
            </template>
            <template v-else-if="plan.key === 'guild'">
              <div class="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                {{
                  guildInterval === 'annual'
                    ? t('billing.guild_annual')
                    : t('billing.guild_monthly')
                }}
              </div>
            </template>
            <template v-else-if="plan.key !== 'free'">
              <div class="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                {{ phaseBillingHint }}
              </div>
            </template>
          </div>
        </div>

        <p class="mb-6 min-h-13 text-base text-gray-400 font-medium leading-relaxed">
          {{ t(`plan.${plan.key}.description`) }}
        </p>

        <ul class="grow space-y-3 mb-6">
          <li
            v-for="(feature, fIndex) in getVisibleFeatures(plan)"
            :key="fIndex"
            class="flex items-start gap-3 text-[13px] leading-5 font-medium text-gray-300"
          >
            <UIcon
              name="i-heroicons-check-circle-solid"
              class="w-4.5 h-4.5 shrink-0 mt-0.5 text-primary-500"
            />
            <span class="leading-tight">{{ t(`plan.${plan.key}.feature_${fIndex + 1}`) }}</span>
          </li>
        </ul>

        <div class="mt-auto space-y-3 pt-5 border-t border-white/5">
          <UButton
            block
            size="lg"
            class="h-13 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all"
            :color="isPrimaryPlan(plan) ? 'primary' : 'neutral'"
            :variant="isPrimaryPlan(plan) ? 'solid' : 'outline'"
            :disabled="isCurrentPlan(plan) || loading"
            @click.stop="handlePlanSelect(plan)"
          >
            {{ getButtonLabel(plan) }}
          </UButton>
        </div>
      </div>
    </div>

    <UModal v-model:open="showConfirmModal">
      <template #content>
        <div
          class="floating-card-base grain-overlay rounded-[2.5rem] p-10 overflow-hidden relative"
        >
          <div class="absolute top-0 right-0 p-8 opacity-5">
            <UIcon name="i-heroicons-exclamation-triangle-solid" class="w-24 h-24" />
          </div>

          <div class="relative z-10">
            <h3 class="text-3xl font-black text-white font-athletic italic uppercase mb-6">
              {{ pendingModalTitle }}
            </h3>
            <p class="text-lg text-gray-400 font-medium leading-relaxed mb-8">
              {{ pendingModalWarning }}
            </p>

            <div class="flex flex-col sm:flex-row gap-4">
              <UButton
                color="neutral"
                variant="outline"
                size="xl"
                class="flex-1 h-14 rounded-xl text-[11px] font-black uppercase tracking-widest"
                @click="
                  () => {
                    showConfirmModal = false
                  }
                "
              >
                {{ pendingChangeKind === 'downgrade' ? t('modal.keep_plan') : t('modal.cancel') }}
              </UButton>
              <UButton
                color="primary"
                variant="solid"
                size="xl"
                class="flex-1 h-14 rounded-xl text-[11px] font-black uppercase tracking-widest"
                :loading="loading"
                @click="
                  () => {
                    planToChangeTo && executePlanChange(planToChangeTo)
                  }
                "
              >
                {{ pendingModalConfirm }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
  import { useTranslate } from '@tolgee/vue'
  import {
    PRICING_PLANS,
    formatPrice,
    getStripePriceId,
    intervalForPlan,
    planKeyForSubscriptionTier,
    subscriptionTierForPlan,
    toStripeBillingInterval,
    type BillingInterval,
    type GuildBillingInterval,
    type PricingPlan,
    type PricingTier,
    type UiBillingInterval
  } from '~/utils/pricing'

  const { t } = useTranslate('pricing')
  function translate(key: string): string {
    return (t.value as (key: string) => string)(key)
  }

  type ConversionGoal = Exclude<PricingTier, 'free'>

  const props = withDefaults(
    defineProps<{
      conversionGoal?: ConversionGoal
    }>(),
    {
      conversionGoal: 'unlock'
    }
  )

  const emit = defineEmits<{
    close: []
  }>()

  const { status } = useAuth()
  const userStore = useUserStore()
  const { createCheckoutSession, openCustomerPortal, changePlan } = useStripe()
  const { currency, setCurrency } = useCurrency()
  const { priceFor, monthlyEquivalent, annualSavings } = useLivePricing()
  const { data: currentSubscription } = useAsyncData<{
    priceId: string | null
    interval: BillingInterval | 'monthly' | 'annual' | null
  }>('current-stripe-subscription', () => ($fetch as any)('/api/stripe/subscription'), {
    lazy: true
  })

  type PlanChangeKind = 'upgrade' | 'interval' | 'downgrade'

  const PLAN_TIERS = ['FREE', 'SUPPORTER', 'UNCOVER', 'UNLOCK', 'UNLEASH'] as const

  const guildInterval = ref<GuildBillingInterval>('monthly')
  const phaseInterval = ref<BillingInterval>('1-phase')

  const guildIntervalOptions = computed(() => [
    { value: 'monthly' as const, label: translate('billing.monthly') },
    { value: 'annual' as const, label: translate('billing.annual') }
  ])

  const phaseIntervalOptions = computed(() => [
    { value: '1-phase' as const, label: translate('billing.phase_1') },
    { value: '6-phase' as const, label: translate('billing.phase_6') },
    { value: '12-phase' as const, label: translate('billing.phase_12') }
  ])

  const guildPlan = computed(() => PRICING_PLANS.find((p) => p.key === 'guild')!)
  const coachingPlans = computed(() =>
    PRICING_PLANS.filter((p) => p.key === 'uncover' || p.key === 'unlock' || p.key === 'unleash')
  )

  const guildSavings = computed(() => annualSavings(guildPlan.value, currency.value))
  const coachingSavings = computed(() => {
    const savings = coachingPlans.value
      .map((plan) => annualSavings(plan, currency.value))
      .filter((value): value is number => value !== null)
    return savings.length > 0 ? Math.max(...savings) : null
  })

  function planInterval(plan: PricingPlan): UiBillingInterval {
    return intervalForPlan(plan, guildInterval.value, phaseInterval.value)
  }

  function showsLongTermSavings(plan: PricingPlan): boolean {
    if (!plan.phase12Price) return false
    if (plan.key === 'guild') return guildInterval.value === 'annual'
    return phaseInterval.value === '12-phase'
  }

  const phaseBillingHint = computed(() => {
    if (phaseInterval.value === '6-phase') return translate('billing.billed_6_phase')
    if (phaseInterval.value === '12-phase') return translate('billing.billed_12_phase')
    return translate('billing.billed_1_phase')
  })

  const loading = ref(false)
  const selectedPlan = ref<string | null>(null)
  const showConfirmModal = ref(false)
  const planToChangeTo = ref<PricingPlan | null>(null)
  const pendingChangeKind = ref<PlanChangeKind>('downgrade')

  const pendingPriceLabel = computed(() =>
    planToChangeTo.value
      ? formatPrice(
          priceFor(planToChangeTo.value, planInterval(planToChangeTo.value), currency.value),
          currency.value
        )
      : ''
  )

  const pendingIntervalLabel = computed(() => {
    if (!planToChangeTo.value) return ''
    if (planToChangeTo.value.key === 'guild') {
      return guildInterval.value === 'annual'
        ? translate('billing.annual')
        : translate('billing.monthly')
    }
    if (phaseInterval.value === '6-phase') return translate('billing.phase_6')
    if (phaseInterval.value === '12-phase') return translate('billing.phase_12')
    return translate('billing.phase_1')
  })

  const pendingModalTitle = computed(() => {
    if (pendingChangeKind.value === 'upgrade') return translate('modal.upgrade_title')
    if (pendingChangeKind.value === 'interval') return translate('modal.interval_title')
    return translate('modal.title')
  })

  const pendingModalWarning = computed(() => {
    if (pendingChangeKind.value === 'upgrade') {
      return (t.value as (key: string, params?: Record<string, string>) => string)(
        'modal.upgrade_warning',
        { price: pendingPriceLabel.value }
      )
    }
    if (pendingChangeKind.value === 'interval') {
      return (t.value as (key: string, params?: Record<string, string>) => string)(
        'modal.interval_warning',
        { interval: pendingIntervalLabel.value, price: pendingPriceLabel.value }
      )
    }
    return translate('modal.warning')
  })

  const pendingModalConfirm = computed(() => {
    if (pendingChangeKind.value === 'upgrade') return translate('modal.upgrade_confirm')
    if (pendingChangeKind.value === 'interval') return translate('modal.interval_confirm')
    return translate('modal.confirm_change')
  })

  function priceSuffix(plan: PricingPlan): string {
    if (plan.key === 'free') return ''
    if (plan.key === 'guild') {
      return guildInterval.value === 'annual'
        ? translate('billing.per_52_weeks')
        : translate('billing.per_month')
    }
    if (phaseInterval.value === '6-phase') return translate('billing.per_6_phases')
    if (phaseInterval.value === '12-phase') return translate('billing.per_12_phases')
    return translate('billing.per_phase')
  }

  function planChangeKind(plan: PricingPlan): PlanChangeKind {
    const currentLevel = PLAN_TIERS.indexOf(
      (userStore.user?.subscriptionTier || 'FREE').toUpperCase() as (typeof PLAN_TIERS)[number]
    )
    const planLevel = PLAN_TIERS.indexOf(
      subscriptionTierForPlan(plan.key) as (typeof PLAN_TIERS)[number]
    )
    if (planLevel > currentLevel) return 'upgrade'
    if (planLevel === currentLevel) return 'interval'
    return 'downgrade'
  }

  const displayedPlans = computed(() => {
    const planByKey = new Map(PRICING_PLANS.map((plan) => [plan.key, plan]))
    const orderedKeys: PricingTier[] =
      props.conversionGoal === 'unleash'
        ? ['unleash', 'unlock', 'uncover', 'guild']
        : ['guild', 'uncover', 'unlock', 'unleash']

    return orderedKeys
      .map((key) => planByKey.get(key))
      .filter((plan): plan is PricingPlan => Boolean(plan))
  })

  function isCurrentTier(plan: PricingPlan): boolean {
    if (!userStore.user || status.value !== 'authenticated') return false
    return planKeyForSubscriptionTier(userStore.user.subscriptionTier) === plan.key
  }

  function isCurrentPlan(plan: PricingPlan): boolean {
    if (!isCurrentTier(plan)) return false
    if (plan.key === 'free') return true
    const current = currentSubscription.value
    if (!current?.priceId) return true
    if (current.interval) {
      return (
        toStripeBillingInterval(current.interval as UiBillingInterval) ===
        toStripeBillingInterval(planInterval(plan))
      )
    }
    return current.priceId === getStripePriceId(plan, planInterval(plan), currency.value)
  }

  function isPrimaryPlan(plan: PricingPlan): boolean {
    return plan.key === props.conversionGoal
  }

  function getPlanBadge(plan: PricingPlan): string | null {
    if (isPrimaryPlan(plan)) {
      return props.conversionGoal === 'unleash'
        ? translate('badge.best_value')
        : translate('badge.most_popular')
    }
    return null
  }

  function getCardClass(plan: PricingPlan): string {
    if (isPrimaryPlan(plan)) {
      return 'border-primary-500/50 lg:scale-[1.02] z-10'
    }
    return 'border-white/5 opacity-85 hover:opacity-100'
  }

  function getPlanOrderClass(plan: PricingPlan): string {
    if (props.conversionGoal !== 'unleash') return ''
    if (plan.key === 'uncover') return 'lg:order-1'
    if (plan.key === 'unlock') return 'lg:order-2'
    if (plan.key === 'unleash') return 'lg:order-3'
    return 'lg:order-4'
  }

  function getButtonLabel(plan: PricingPlan): string {
    if (isCurrentPlan(plan)) return translate('btn.current_plan')
    if (status.value !== 'authenticated') {
      if (plan.key === 'free') return translate('btn.start_free')
      if (plan.key === 'guild') return translate('btn.join_guild')
      if (plan.key === 'uncover') return translate('btn.get_uncover')
      if (plan.key === 'unlock') return translate('btn.get_unlock')
      return translate('btn.get_unleash')
    }

    const currentLevel = PLAN_TIERS.indexOf(
      (userStore.user?.subscriptionTier || 'FREE').toUpperCase() as (typeof PLAN_TIERS)[number]
    )
    const planLevel = PLAN_TIERS.indexOf(
      subscriptionTierForPlan(plan.key) as (typeof PLAN_TIERS)[number]
    )

    if (planLevel > currentLevel) return translate('btn.upgrade')
    if (planLevel < currentLevel) return translate('btn.downgrade')
    if (plan.key === 'guild') {
      return guildInterval.value === 'annual'
        ? translate('billing.annual')
        : translate('billing.monthly')
    }
    if (phaseInterval.value === '6-phase') return translate('billing.phase_6')
    if (phaseInterval.value === '12-phase') return translate('billing.phase_12')
    return translate('billing.phase_1')
  }

  function getVisibleFeatures(plan: PricingPlan): string[] {
    return plan.features
  }

  async function executePlanChange(plan: PricingPlan) {
    loading.value = true
    selectedPlan.value = plan.key

    const priceId = getStripePriceId(plan, planInterval(plan), currency.value)
    if (priceId) {
      const kind = planChangeKind(plan)
      const direction = kind === 'upgrade' ? 'upgrade' : 'downgrade'

      const success = await changePlan(priceId, direction)
      if (success) {
        showConfirmModal.value = false
        emit('close')
        navigateTo('/settings/billing?success=true')
        return
      }
    }
    loading.value = false
    selectedPlan.value = null
    showConfirmModal.value = false
  }

  async function handlePlanSelect(plan: PricingPlan) {
    if (userStore.user?.stripeCustomerId && userStore.user?.subscriptionTier !== 'FREE') {
      const kind = planChangeKind(plan)

      if (kind === 'upgrade' || kind === 'interval') {
        planToChangeTo.value = plan
        pendingChangeKind.value = kind
        showConfirmModal.value = true
        return
      }

      if (plan.key !== 'free') {
        planToChangeTo.value = plan
        pendingChangeKind.value = 'downgrade'
        showConfirmModal.value = true
        return
      }

      loading.value = true
      selectedPlan.value = plan.key
      await openCustomerPortal(window.location.href)
      loading.value = false
      selectedPlan.value = null
      return
    }

    if (plan.key === 'free') {
      navigateTo(status.value === 'authenticated' ? '/dashboard' : '/join')
      return
    }

    if (status.value !== 'authenticated') {
      navigateTo(`/join?plan=${plan.key}&interval=${planInterval(plan)}`)
      return
    }

    const priceId = getStripePriceId(plan, planInterval(plan), currency.value)
    if (!priceId) return

    loading.value = true
    selectedPlan.value = plan.key
    await createCheckoutSession(priceId, {
      successUrl: `${window.location.origin}/settings/billing?success=true`,
      cancelUrl: `${window.location.origin}/settings/billing?canceled=true`
    })
    loading.value = false
  }
</script>

<style scoped>
  @keyframes pulseBorder {
    0%,
    100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.01);
    }
  }

  .animate-pulse-border {
    animation: pulseBorder 3s ease-in-out infinite;
  }
</style>
