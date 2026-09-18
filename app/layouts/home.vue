<template>
  <div
    class="min-h-screen flex flex-col font-sans bg-[oklch(12%_0.015_155)] text-gray-100 overflow-x-clip"
  >
    <header
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      :class="[
        y > 50
          ? 'bg-slate-950/80 backdrop-blur-lg border-b border-white/10 shadow-lg'
          : 'bg-transparent'
      ]"
    >
      <div
        class="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 transition-all duration-300"
        :class="y > 50 ? 'h-20' : 'h-24 pt-2'"
      >
        <NuxtLink
          :to="route.path === '/tri-nerds' ? '/tri-nerds' : '/'"
          class="flex shrink-0 items-center transition-opacity hover:opacity-90 relative z-50"
        >
          <img
            v-if="route.path === '/tri-nerds'"
            src="/media/Tri%20Nerd%20Logos/TriNerds_pixelbadge_logo.png"
            alt="Tri Nerds"
            class="h-10 w-auto object-contain sm:h-12"
          />
          <img
            v-else
            src="/media/logo.webp"
            alt="Journey Endurance"
            class="w-auto object-contain drop-shadow-lg transition-all duration-300"
            :class="y > 50 ? 'h-12 sm:h-16' : 'h-16 sm:h-20'"
          />
        </NuxtLink>

        <!-- Navigation for Tri Nerds (Removed for minimalist sales page) -->
        <!-- Navigation for Journey Endurance (Removed for minimalist sales page) -->

        <!-- CTAs -->
        <div class="flex items-center gap-2 mt-2">
          <template v-if="!isAuthPage && isSignedIn">
            <UButton
              to="/dashboard"
              color="white"
              class="text-black uppercase tracking-widest font-bold whitespace-nowrap px-6 rounded-sm"
              >Dashboard</UButton
            >
          </template>
          <template v-else-if="!isAuthPage">
            <!-- Tri Nerds CTAs -->
            <template v-if="route.path === '/tri-nerds'">
              <UButton
                to="/login"
                variant="ghost"
                color="neutral"
                class="hidden sm:flex whitespace-nowrap"
                >Sign In</UButton
              >
              <UButton
                to="/join"
                color="primary"
                class="whitespace-nowrap transition-all duration-300"
                >{{ headerCtaText }}</UButton
              >
            </template>
            <!-- Journey Endurance CTA -->
            <template v-else>
              <UButton
                to="/login"
                color="white"
                class="!bg-white/85 backdrop-blur-sm text-slate-900 hover:!bg-slate-200/90 uppercase tracking-widest text-xs font-bold whitespace-nowrap px-8 py-2.5 rounded-sm shadow-md transition-all"
                >SIGN IN</UButton
              >
            </template>
          </template>
        </div>
      </div>
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <PublicFooter v-if="!isAuthPage" />
  </div>
</template>

<script setup>
  import { useWindowScroll } from '@vueuse/core'
  import PublicFooter from '~/components/layout/PublicFooter.vue'

  const { y } = useWindowScroll()
  const headerCtaText = useState('headerCtaText', () => 'Join the Community')

  const route = useRoute()
  const { data: authData, status: authStatus } = useAuth()
  const isAuthPage = computed(() => route.path === '/join' || route.path === '/login')
  const isSignedIn = computed(
    () => authStatus.value === 'authenticated' || Boolean(authData.value?.user)
  )

  useHead({
    link: [
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap'
      }
    ]
  })

  const colorMode = useColorMode()
  const prevPreference = colorMode.preference
  colorMode.preference = 'dark'
  onBeforeUnmount(() => {
    colorMode.preference = prevPreference
  })
</script>
