<template>
  <div
    class="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-x-clip bg-[oklch(12%_0.015_155)] px-4 py-10 sm:px-6 lg:py-16"
  >
    <UContainer class="relative z-10 w-full max-w-md">
      <div
        class="overflow-hidden rounded-2xl border border-white/10 bg-[oklch(14%_0.018_155)] p-8 sm:p-12"
      >
        <h1
          class="font-athletic mb-2 text-center text-3xl font-bold uppercase leading-[0.9] tracking-tight text-white"
        >
          {{ t('login.email_page_title') }}
          <span class="text-primary-400">{{ t('login.email_page_title_accent') }}</span>
        </h1>
        <p class="mb-8 text-center text-sm font-medium text-gray-400">
          {{ t('login.email_page_subtitle') }}
        </p>

        <div
          v-if="magicLinkSent"
          class="rounded-xl border border-primary-500/20 bg-primary-500/10 p-4 text-center"
        >
          <UIcon
            name="i-heroicons-check-circle-solid"
            class="mx-auto mb-2 h-8 w-8 text-primary-400"
          />
          <p class="text-sm text-gray-300">
            {{ t('login.email_success') }}
          </p>
        </div>

        <form v-else class="space-y-4" @submit.prevent="handleSubmit">
          <UInput
            v-model="email"
            type="email"
            :placeholder="t('login.email_placeholder')"
            required
            autocomplete="email"
            size="xl"
            class="w-full"
            :disabled="loading"
          />

          <!-- Honeypot -->
          <input
            v-model="website"
            type="text"
            name="website"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
            class="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
          />

          <ClientOnly>
            <div v-if="turnstileSiteKey" class="flex justify-center">
              <div ref="turnstileEl" />
            </div>
          </ClientOnly>

          <UButton
            type="submit"
            block
            size="xl"
            color="primary"
            variant="solid"
            class="h-14 min-w-full rounded-xl text-xs font-bold uppercase tracking-[0.15em]"
            :loading="loading"
            :disabled="turnstileSiteKey ? !turnstileToken : false"
          >
            {{ t('login.email_submit') }}
          </UButton>
        </form>

        <div class="mt-6 text-center">
          <NuxtLink
            :to="loginBackTo"
            class="text-sm font-medium text-gray-400 transition-colors hover:text-white"
          >
            &larr; {{ t('login.email_back') }}
          </NuxtLink>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
  import { useTranslate } from '@tolgee/vue'

  const { t } = useTranslate('auth')
  const route = useRoute()
  const toast = useToast()
  const { trackLogin } = useAnalytics()
  const runtimeConfig = useRuntimeConfig()

  definePageMeta({
    layout: 'home',
    middleware: ['guest'],
    auth: false
  })

  const callbackUrl = (route.query.callbackUrl as string) || '/dashboard'
  const loginBackTo = computed(() =>
    callbackUrl === '/dashboard'
      ? '/login'
      : `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
  )

  const turnstileSiteKey = computed(
    () => (runtimeConfig.public.turnstileSiteKey as string | undefined) || ''
  )

  const email = ref('')
  const website = ref('')
  const loading = ref(false)
  const magicLinkSent = ref(false)
  const turnstileToken = ref('')
  const turnstileEl = ref<HTMLElement | null>(null)
  let turnstileWidgetId: string | undefined

  useSeoMeta({
    title: () => t.value('login.email_page_seo_title'),
    description: () => t.value('login.email_page_subtitle')
  })

  type TurnstileApi = {
    render: (el: HTMLElement, opts: Record<string, unknown>) => string
    reset: (id?: string) => void
  }

  function loadTurnstileScript(): Promise<void> {
    if (typeof window === 'undefined') return Promise.resolve()
    const w = window as Window & { turnstile?: TurnstileApi }
    if (w.turnstile) return Promise.resolve()
    return new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]')
      if (existing) {
        existing.addEventListener('load', () => resolve())
        existing.addEventListener('error', () => reject(new Error('Turnstile failed to load')))
        return
      }
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.dataset.turnstile = '1'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Turnstile failed to load'))
      document.head.appendChild(script)
    })
  }

  async function mountTurnstile() {
    if (!turnstileSiteKey.value || !turnstileEl.value) return
    await loadTurnstileScript()
    const w = window as Window & { turnstile?: TurnstileApi }
    if (!w.turnstile || turnstileWidgetId) return
    turnstileWidgetId = w.turnstile.render(turnstileEl.value, {
      sitekey: turnstileSiteKey.value,
      theme: 'dark',
      callback: (token: string) => {
        turnstileToken.value = token
      },
      'expired-callback': () => {
        turnstileToken.value = ''
      },
      'error-callback': () => {
        turnstileToken.value = ''
      }
    })
  }

  onMounted(() => {
    void mountTurnstile()
  })

  watch(turnstileEl, () => {
    void mountTurnstile()
  })

  async function handleSubmit() {
    loading.value = true
    try {
      await $fetch('/api/auth/email-magic-link/request', {
        method: 'POST',
        body: {
          email: email.value.trim(),
          returnTo: callbackUrl,
          turnstileToken: turnstileToken.value || undefined,
          website: website.value
        }
      })
      magicLinkSent.value = true
      trackLogin('email')
    } catch (error: any) {
      toast.add({
        title: t.value('login.error_title'),
        description: error.data?.statusMessage || error.message || t.value('login.error_email'),
        color: 'error'
      })
      turnstileToken.value = ''
      const w = window as Window & { turnstile?: TurnstileApi }
      if (turnstileWidgetId && w.turnstile) w.turnstile.reset(turnstileWidgetId)
    } finally {
      loading.value = false
    }
  }
</script>
