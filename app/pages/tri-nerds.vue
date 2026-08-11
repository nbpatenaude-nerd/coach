<template>
  <div class="relative min-h-screen overflow-x-clip bg-slate-950 selection:bg-cyan-500/30">
    <div class="pointer-events-none fixed inset-0 z-10 opacity-[0.03] grain-overlay" />

    <!-- Interactive Background Pattern -->
    <div class="fixed inset-0 z-0 opacity-40">
      <UiInteractiveGridPattern
        :squares="[60, 40]"
        squares-class-name="text-cyan-500/50 hover:text-purple-400/80"
        class-name="[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)]"
      />
    </div>

    <div ref="hyperlaneRef" class="relative pb-24 sm:pb-32 z-10">
      <!-- Continuous Glowing Hyperlane Route Line -->
      <div
        class="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 sm:-translate-x-1/2 bg-slate-800/50 pointer-events-none z-0"
      >
        <div
          class="w-full bg-linear-to-b from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(34,211,238,0.8)] transition-all duration-100 ease-out"
          :style="{ height: `${scrollProgress}%` }"
        ></div>
      </div>

      <div ref="heroSectionRef">
        <LandingHero class="mb-8 sm:mb-12 relative z-10" />
      </div>

      <div ref="originSectionRef">
        <LandingOriginStory class="py-16 sm:py-20 relative z-10" />
      </div>

      <div ref="journeySectionRef">
        <LandingJourneyTimeline class="py-16 sm:py-20 relative z-10" />
      </div>

      <div ref="pricingSectionRef">
        <LandingPricing class="py-20 sm:py-24 relative z-10" />
      </div>

      <!-- The Final Waypoint Node -->
      <div
        class="absolute bottom-0 left-6 sm:left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full transition-all duration-500 z-20"
        :class="[
          scrollProgress > 98
            ? 'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)] scale-125 animate-pulse'
            : 'bg-slate-700 shadow-none'
        ]"
      ></div>
    </div>

    <!-- Closing band (The Footer / Community Hook) -->
    <section
      ref="closingSectionRef"
      class="bg-slate-900/80 backdrop-blur-md px-6 pt-12 pb-24 sm:pb-32 lg:px-8 transition-all duration-700 transform relative z-10"
      :class="[isClosingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12']"
    >
      <div class="mx-auto flex max-w-352 flex-col items-center text-center gap-8 mt-12 sm:mt-16">
        <h2
          class="font-athletic text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl"
        >
          The Journey is the Destination.
        </h2>
        <p class="mt-4 max-w-2xl text-lg leading-8 text-cyan-100/70">
          Whether you're training for your first sprint triathlon or trying to shave 5 minutes off
          your Ironman PR, do it with the data on your side and the community at your back.
        </p>
        <div class="mt-8 flex flex-wrap items-center gap-4">
          <UButton
            size="xl"
            to="/join"
            class="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold whitespace-nowrap shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            >Join the Community</UButton
          >
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useIntersectionObserver, useElementBounding, useWindowSize } from '@vueuse/core'

  const { status } = useAuth()
  const headerCtaText = useState('headerCtaText')

  // Set default
  headerCtaText.value = 'Take the Next Step'

  // Scroll Progress Math for the Hyperlane Track
  const hyperlaneRef = ref(null)
  const { top, height } = useElementBounding(hyperlaneRef)
  const { height: windowHeight } = useWindowSize()

  const scrollProgress = computed(() => {
    const viewportMiddle = windowHeight.value / 2
    const scrolledPast = viewportMiddle - top.value

    if (scrolledPast <= 0) return 0
    if (scrolledPast >= height.value) return 100

    return (scrolledPast / height.value) * 100
  })

  // Section Refs
  const heroSectionRef = ref(null)
  const originSectionRef = ref(null)
  const journeySectionRef = ref(null)
  const pricingSectionRef = ref(null)
  const closingSectionRef = ref(null)
  const isClosingVisible = ref(false)

  // Observers for CTA changing
  useIntersectionObserver(
    journeySectionRef,
    (entries) => {
      if (entries[0]?.isIntersecting) headerCtaText.value = 'Explore the Tech'
    },
    { threshold: 0.3 }
  )

  useIntersectionObserver(
    pricingSectionRef,
    (entries) => {
      if (entries[0]?.isIntersecting) headerCtaText.value = 'Choose Your Tier'
    },
    { threshold: 0.3 }
  )

  useIntersectionObserver(
    heroSectionRef,
    (entries) => {
      if (entries[0]?.isIntersecting) headerCtaText.value = 'Take the Next Step'
    },
    { threshold: 0.3 }
  )

  useIntersectionObserver(
    closingSectionRef,
    (entries) => {
      if (entries[0]?.isIntersecting) isClosingVisible.value = true
    },
    { threshold: 0.2 }
  )

  definePageMeta({
    layout: 'home',
    auth: false
  })

  useSeoMeta({
    title: 'Tri Nerds Endurance Club',
    ogTitle: 'Tri Nerds Endurance Club',
    description: 'Level Up Your Endurance. Powered by the Journey Endurance AI.',
    ogDescription: 'Level Up Your Endurance. Powered by the Journey Endurance AI.'
  })

  const route = useRoute()

  watchEffect(() => {
    if (status.value === 'authenticated' && route.query.preview !== '1') {
      navigateTo('/dashboard')
    }
  })
</script>
