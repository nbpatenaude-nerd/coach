<template>
  <div id="pricing" class="relative isolate overflow-hidden bg-transparent py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div
        ref="headerRef"
        class="mx-auto mb-16 max-w-2xl text-center transition-all duration-700 transform relative bg-slate-950/60 backdrop-blur-sm p-8 sm:p-12 rounded-3xl border border-cyan-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        :class="[isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12']"
      >
        <div
          class="absolute -top-12 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)] z-20"
        ></div>
        <h2
          class="font-athletic text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500"
        >
          The Journey Framework
        </h2>
        <p class="mt-4 text-lg leading-8 text-cyan-100/70">
          From free community support to elite telemetry and performance analysis.
        </p>
      </div>

      <div
        ref="cardsRef"
        class="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-7xl lg:grid-cols-4"
      >
        <!-- Tier 1: FREE -->
        <UCard
          class="flex flex-col justify-between bg-slate-950/60 backdrop-blur-sm border border-cyan-500/20 h-full transition-all duration-700 transform hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:border-cyan-400/50"
          :class="[isCardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16']"
          :style="{ transitionDelay: '100ms' }"
        >
          <div>
            <div class="mb-4">
              <span class="text-cyan-400 font-semibold text-sm uppercase tracking-wide"
                >Tri Nerds Guild</span
              >
              <div class="mt-4 flex items-baseline text-5xl font-extrabold text-white">$0</div>
              <p class="mt-2 text-sm text-cyan-100/50">FREE</p>
            </div>
            <ul role="list" class="mt-8 space-y-4 text-sm leading-6 text-cyan-100/80">
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-cyan-400" />
                <span>One-Time AI 12-Wk Plan</span>
              </li>
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-cyan-400" />
                <span>Pre-made library access</span>
              </li>
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-cyan-400" />
                <span>Synced/Pushed Workouts</span>
              </li>
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-cyan-400" />
                <span>Community Calendar</span>
              </li>
            </ul>
          </div>
          <div class="mt-8">
            <UButton
              to="/join"
              block
              variant="outline"
              class="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >Join the Guild</UButton
            >
          </div>
        </UCard>

        <!-- Tier 2: UNCOVER -->
        <UCard
          class="flex flex-col justify-between bg-slate-900/60 backdrop-blur-md border border-cyan-500/20 h-full transition-all duration-700 transform hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:border-cyan-400/50"
          :class="[isCardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16']"
          :style="{ transitionDelay: '200ms' }"
        >
          <div>
            <div class="mb-4">
              <span class="text-cyan-400 font-semibold text-sm uppercase tracking-wide"
                >Foundational</span
              >
              <div class="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                $200<span class="text-lg font-medium text-cyan-100/50 ml-1">/mo</span>
              </div>
              <p class="mt-2 text-sm text-cyan-100/50">UNCOVER</p>
            </div>
            <ul role="list" class="mt-8 space-y-4 text-sm leading-6 text-cyan-100/80">
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-cyan-400" />
                <span>Team Program</span>
              </li>
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-cyan-400" />
                <span>Weekly Check-In</span>
              </li>
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-cyan-400" />
                <span>Team Dashboard</span>
              </li>
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-cyan-400" />
                <span>Group Q&A</span>
              </li>
            </ul>
          </div>
          <div class="mt-8">
            <UButton
              to="/join"
              block
              variant="outline"
              class="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >Start Uncover</UButton
            >
          </div>
        </UCard>

        <!-- Tier 3: UNLOCK -->
        <UCard
          class="flex flex-col justify-between bg-slate-900/60 backdrop-blur-md border border-pink-500/50 ring-1 ring-pink-500/50 h-full relative overflow-hidden transition-all duration-700 transform hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]"
          :class="[isCardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16']"
          :style="{ transitionDelay: '300ms' }"
        >
          <div
            class="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 bg-pink-500 rounded-full opacity-10 blur-xl pointer-events-none"
          ></div>
          <div class="relative z-10 flex-grow">
            <div class="mb-4">
              <span
                class="text-pink-400 font-semibold text-sm uppercase tracking-wide flex flex-wrap items-center gap-2"
              >
                Custom Coaching
                <UBadge
                  color="pink"
                  variant="subtle"
                  size="xs"
                  class="bg-pink-500/10 text-pink-400 ring-pink-500/30"
                  >MOST POPULAR</UBadge
                >
              </span>
              <div class="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                $350<span class="text-lg font-medium text-cyan-100/50 ml-1">/mo</span>
              </div>
              <p class="mt-2 text-sm text-pink-400/80 font-bold tracking-widest">UNLOCK</p>
            </div>
            <ul role="list" class="mt-8 space-y-4 text-sm leading-6 text-cyan-100/80">
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-pink-500" />
                <span>Custom 1:1 Coaching</span>
              </li>
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-pink-500" />
                <span>Daily Check-In & AI Chat</span>
              </li>
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-pink-500" />
                <span>Daily Digital Twin AI</span>
              </li>
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-pink-500" />
                <span>Glycogen Fuel Tank</span>
              </li>
            </ul>
          </div>
          <div class="mt-8 relative z-10">
            <UButton
              to="/join"
              block
              class="bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)]"
              >Apply for Unlock</UButton
            >
          </div>
        </UCard>

        <!-- Tier 4: UNLEASH -->
        <UCard
          class="flex flex-col justify-between bg-slate-900/60 backdrop-blur-md border border-cyan-500/20 h-full transition-all duration-700 transform hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:border-cyan-400/50"
          :class="[isCardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16']"
          :style="{ transitionDelay: '400ms' }"
        >
          <div>
            <div class="mb-4">
              <span class="text-purple-400 font-semibold text-sm uppercase tracking-wide"
                >Elite</span
              >
              <div class="mt-4 flex items-baseline text-3xl font-extrabold text-white">
                Waitlist
              </div>
              <p class="mt-2 text-sm text-cyan-100/50">UNLEASH</p>
            </div>
            <ul role="list" class="mt-8 space-y-4 text-sm leading-6 text-cyan-100/80">
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-purple-400" />
                <span>Elite Telemetry</span>
              </li>
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-purple-400" />
                <span>Live Energy Availability</span>
              </li>
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-purple-400" />
                <span>Performance Scores</span>
              </li>
              <li class="flex gap-x-3">
                <UIcon name="i-heroicons-check" class="h-6 w-5 flex-none text-purple-400" />
                <span>Executive AI Reports</span>
              </li>
            </ul>
          </div>
          <div class="mt-8">
            <UButton
              to="/join"
              block
              variant="outline"
              class="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400"
              >Join Waitlist</UButton
            >
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useIntersectionObserver } from '@vueuse/core'

  const headerRef = ref(null)
  const isHeaderVisible = ref(false)

  const cardsRef = ref(null)
  const isCardsVisible = ref(false)

  useIntersectionObserver(
    headerRef,
    ([{ isIntersecting }]) => {
      if (isIntersecting) isHeaderVisible.value = true
    },
    { threshold: 0.1 }
  )

  useIntersectionObserver(
    cardsRef,
    ([{ isIntersecting }]) => {
      if (isIntersecting) isCardsVisible.value = true
    },
    { threshold: 0.1 }
  )
</script>
