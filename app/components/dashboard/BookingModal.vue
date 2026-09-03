<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-fade-in"
      @click.self="emit('close')"
    >
      <div
        class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative max-w-4xl w-full h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        <!-- Modal Header -->
        <div
          class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-900/50"
        >
          <div class="flex items-center gap-3">
            <div
              class="p-2 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 shrink-0"
            >
              <UIcon name="i-heroicons-calendar" class="w-5 h-5" />
            </div>
            <div>
              <h2
                id="booking-modal-title"
                class="text-base font-bold text-gray-900 dark:text-white"
              >
                {{ t('monthly_call_modal_title', 'Monthly Coaching Call') }}
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{
                  t(
                    'monthly_call_modal_subtitle',
                    'Schedule your 1-on-1 monthly check-in call with Coach Nick'
                  )
                }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              :to="DIRECT_BOOKING_URL"
              target="_blank"
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-heroicons-arrow-top-right-on-square"
              class="hidden sm:inline-flex"
            >
              {{ t('monthly_call_modal_open_external', 'Open in New Tab') }}
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-heroicons-x-mark"
              aria-label="Close booking modal"
              @click="emit('close')"
            />
          </div>
        </div>

        <!-- Visual Calendar Container -->
        <div class="relative w-full flex-1 overflow-y-auto min-h-0 bg-white dark:bg-gray-900">
          <div
            v-if="isLoading"
            class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xs"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
              {{ t('monthly_call_modal_loading', 'Loading calendar...') }}
            </p>
          </div>

          <div ref="containerRef" class="w-full h-full min-h-[650px]" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { useTranslate } from '@tolgee/vue'

  const { t } = useTranslate('dashboard')

  const emit = defineEmits<{
    (e: 'close' | 'booked'): void
  }>()

  const DIRECT_BOOKING_URL = 'https://meet.reclaimai.com/e/91fba874-e588-43c1-a2ac-603c5629cfd0'
  const SCRIPT_ID = 'reclaim-embed-script'

  const containerRef = ref<HTMLDivElement | null>(null)
  const isLoading = ref(true)

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      emit('close')
    }
  }

  function handleWindowMessage(e: MessageEvent) {
    if (e.origin !== 'https://meet.reclaimai.com') return
    if (e.data?.type === 'MEETING_BOOKED') {
      emit('booked')
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('message', handleWindowMessage)

    if (!containerRef.value) return

    // Clean up any previously appended script or object so re-opening works properly
    const existing = document.getElementById(SCRIPT_ID)
    if (existing) {
      existing.remove()
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = 'https://meet.reclaimai.com/scripts/embed-scheduling-link.0.x.x.js'
    script.setAttribute('data-id', '91fba874-e588-43c1-a2ac-603c5629cfd0')
    script.setAttribute('data-redirect', 'NONE')
    script.async = true

    script.onload = () => {
      setTimeout(() => {
        isLoading.value = false
      }, 500)
    }

    containerRef.value.appendChild(script)

    setTimeout(() => {
      isLoading.value = false
    }, 1500)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('message', handleWindowMessage)

    const existing = document.getElementById(SCRIPT_ID)
    if (existing) {
      existing.remove()
    }

    if (containerRef.value) {
      containerRef.value.innerHTML = ''
    }
  })
</script>
