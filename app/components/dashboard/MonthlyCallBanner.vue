<template>
  <div>
    <div
      v-if="shouldShowBanner"
      class="relative overflow-hidden rounded-xl border border-primary-500/20 dark:border-primary-400/20 bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent p-4 sm:p-5 shadow-sm transition-all"
    >
      <!-- Background decorative ambient blur -->
      <div
        class="absolute -right-6 -bottom-6 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl pointer-events-none"
      />

      <div class="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-start sm:items-center gap-3.5">
          <div
            class="p-2.5 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5 sm:mt-0"
          >
            <UIcon name="i-heroicons-calendar-days" class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-gray-900 dark:text-white text-base">
                {{ t('monthly_call_banner_title', 'Monthly Coaching Call') }}
              </h3>
              <UBadge
                color="primary"
                variant="subtle"
                size="xs"
                class="font-semibold uppercase tracking-wider"
              >
                {{ currentMonthName }}
              </UBadge>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
              {{
                t(
                  'monthly_call_banner_desc',
                  "It's the final week of the month! Schedule your 1-on-1 monthly call with Coach Nick."
                )
              }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <UButton
            color="primary"
            variant="solid"
            size="sm"
            icon="i-heroicons-calendar"
            class="font-bold shadow-sm"
            @click="isBookingModalOpen = true"
          >
            {{ t('monthly_call_banner_button', 'Book a Call') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark"
            aria-label="Dismiss monthly call banner"
            @click="dismiss"
          />
        </div>
      </div>
    </div>

    <!-- Booking Modal with Visual Calendar Embed -->
    <DashboardBookingModal
      v-if="isBookingModalOpen"
      @close="isBookingModalOpen = false"
      @booked="handleBooked"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useTranslate } from '@tolgee/vue'
  import { useFormat } from '~/composables/useFormat'
  import { isLastWeekOfMonth, getMonthName } from '~/utils/calendar'

  const { t } = useTranslate('dashboard')
  const { getUserLocalDate } = useFormat()
  const route = useRoute()
  const toast = useToast()

  const isDismissed = ref(false)
  const isBookingModalOpen = ref(false)

  const currentDate = computed(() => getUserLocalDate())

  const currentMonthName = computed(() => {
    return getMonthName(currentDate.value, true)
  })

  const storageKey = computed(() => {
    const d = currentDate.value
    return `monthly-call-banner-dismissed-${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`
  })

  // Explicit dev or QA test query override: ?showMonthlyBanner=true or ?showMonthlyBanner=1
  const isQueryOverride = computed(() => {
    return route.query.showMonthlyBanner === 'true' || route.query.showMonthlyBanner === '1'
  })

  const shouldShowBanner = computed(() => {
    if (isQueryOverride.value) {
      return true
    }

    if (isDismissed.value) {
      return false
    }

    return isLastWeekOfMonth(currentDate.value, true)
  })

  onMounted(() => {
    try {
      const dismissed = localStorage.getItem(storageKey.value)
      if (dismissed === 'true' && !isQueryOverride.value) {
        isDismissed.value = true
      }
    } catch {
      // Ignore localStorage read errors
    }
  })

  function dismiss() {
    isDismissed.value = true
    try {
      localStorage.setItem(storageKey.value, 'true')
    } catch {
      // Ignore localStorage write errors
    }
  }

  function handleBooked() {
    isBookingModalOpen.value = false
    dismiss()
    toast.add({
      title: 'Call Scheduled!',
      description: 'Your monthly coaching call has been booked. See you then!',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
  }
</script>
