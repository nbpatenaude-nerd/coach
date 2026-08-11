<template>
  <div class="relative min-h-screen overflow-x-clip bg-transparent selection:bg-cyan-500/30">
    <!-- Subtle background texture -->
    <div class="pointer-events-none fixed inset-0 z-10 opacity-[0.03] grain-overlay" />

    <div class="relative">
      <LandingHeroJourney />

      <!-- Smooth Parallax Transition (Dark Cloud Effect) -->
      <div class="relative z-20">
        <div
          class="absolute bottom-full left-0 w-full h-[25vh] pointer-events-none"
          style="
            background: linear-gradient(
              to bottom,
              transparent 0%,
              rgba(2, 6, 23, 0.15) 20%,
              rgba(2, 6, 23, 0.4) 45%,
              rgba(2, 6, 23, 0.7) 70%,
              rgb(2, 6, 23) 100%
            );
          "
        ></div>
        <div
          class="absolute bottom-full left-0 w-full h-[35vh] pointer-events-none"
          style="
            background: linear-gradient(
              to bottom,
              transparent 0%,
              transparent 30%,
              rgba(2, 6, 23, 0.3) 60%,
              rgb(2, 6, 23) 100%
            );
          "
        ></div>

        <div class="relative z-10 bg-slate-950 shadow-[0_-10px_30px_rgba(2,6,23,1)]">
          <div class="sticky top-0 w-full h-screen overflow-hidden z-0">
            <MistBackground />
          </div>
          <div class="relative z-10 -mt-[100vh]">
            <LandingJourneyStats />
            <LandingQuestSelection />
            <LandingPathsForged />
            <LandingPricingJourney />

            <!-- Closing Call to Action -->
            <section
              class="bg-transparent border-t border-slate-800 px-6 py-24 sm:py-32 lg:px-8 relative z-10"
            >
              <div
                class="mx-auto flex max-w-4xl flex-col items-center text-center gap-8 relative z-10"
              >
                <h2
                  class="font-athletic text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl"
                >
                  The most important step is always the next one.
                </h2>
                <p class="mt-4 text-lg leading-8 text-cyan-100/70 max-w-2xl">
                  Join the community of athletes redefining their limits. Data-driven coaching,
                  expert support, and unparalleled results.
                </p>
                <div class="mt-8 flex flex-col sm:flex-row items-center gap-4">
                  <UButton
                    size="xl"
                    to="/auth/signin"
                    class="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold whitespace-nowrap px-10 shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]"
                  >
                    Start Your Journey
                  </UButton>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const { status } = useAuth()
  const route = useRoute()

  definePageMeta({
    layout: 'home',
    auth: false
  })

  useSeoMeta({
    title: 'Journey Endurance Coaching',
    ogTitle: 'Journey Endurance Coaching',
    description:
      'Science-backed coaching for Triathlon, Ironman, and Hyrox. Masters-level expertise from Victoria, BC.',
    ogDescription:
      'Science-backed coaching for Triathlon, Ironman, and Hyrox. Masters-level expertise from Victoria, BC.'
  })

  watchEffect(() => {
    if (status.value === 'authenticated' && route.query.preview !== '1') {
      navigateTo('/dashboard')
    }
  })
</script>
