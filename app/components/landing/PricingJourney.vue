<template>
  <section class="py-24 relative z-10">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="font-athletic text-4xl sm:text-5xl font-bold uppercase text-white mb-6">
          Invest in your
          <span class="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-teal-400"
            >Journey</span
          >
        </h2>
        <p class="text-lg text-slate-300">
          Transparent pricing. No hidden fees. Select the coaching package that fits your goals and
          commitment level.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <!-- Tier 1: UNCOVER -->
        <div
          class="pricing-card bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-700 p-8 flex flex-col transition-all duration-300 hover:border-slate-500 shadow-sm group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-linear-to-b from-cyan-400/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-0"
          ></div>
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
            style="
              background: radial-gradient(
                600px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(34, 211, 238, 0.1),
                transparent 40%
              );
            "
          ></div>
          <div class="mb-6 relative z-10">
            <span class="text-cyan-400 font-semibold text-sm uppercase tracking-wide"
              >Foundational</span
            >
            <div class="mt-4 flex items-baseline gap-2 mb-2">
              <span class="text-4xl font-bold text-white">$200</span>
              <span class="text-slate-400">/mo</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-2 uppercase tracking-wide">UNCOVER</h3>
            <p class="text-sm text-slate-400">
              Perfect for athletes looking for structured programming and community support.
            </p>
          </div>
          <ul class="space-y-4 mb-8 grow relative z-10">
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-cyan-400 shrink-0" />
              <span class="text-slate-300 text-sm">Team Program</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-cyan-400 shrink-0" />
              <span class="text-slate-300 text-sm">Weekly Check-In</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-cyan-400 shrink-0" />
              <span class="text-slate-300 text-sm">Team Dashboard</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-cyan-400 shrink-0" />
              <span class="text-slate-300 text-sm">Group Q&A</span>
            </li>
          </ul>
          <UButton
            block
            size="xl"
            variant="outline"
            color="neutral"
            class="text-white border-slate-600 hover:bg-slate-800 font-bold uppercase bg-slate-900/50 relative z-10"
          >
            Start Uncover
          </UButton>
        </div>

        <!-- Tier 2: UNLOCK (Highlighted) -->
        <div
          class="pricing-card bg-slate-900 rounded-3xl border-2 border-pink-500 p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(236,72,153,0.15)] group overflow-hidden z-20"
        >
          <div
            class="absolute inset-0 bg-linear-to-b from-pink-500/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-0"
          ></div>
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
            style="
              background: radial-gradient(
                600px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(236, 72, 153, 0.15),
                transparent 40%
              );
            "
          ></div>
          <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <span
              class="bg-pink-500 text-white text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full"
              >Most Popular</span
            >
          </div>
          <div class="mb-6 relative z-10">
            <span class="text-pink-400 font-semibold text-sm uppercase tracking-wide"
              >Custom Coaching</span
            >
            <div class="mt-4 flex items-baseline gap-2 mb-2">
              <span class="text-4xl font-bold text-white">$350</span>
              <span class="text-slate-400">/mo</span>
            </div>
            <h3 class="text-xl font-bold text-pink-400 mb-2 uppercase tracking-wide">UNLOCK</h3>
            <p class="text-sm text-slate-400">
              Comprehensive daily coaching, data analysis, and direct access to your coach.
            </p>
          </div>
          <ul class="space-y-4 mb-8 grow relative z-10">
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-pink-400 shrink-0" />
              <span class="text-slate-300 text-sm">Custom 1:1 Coaching</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-pink-400 shrink-0" />
              <span class="text-slate-300 text-sm">Daily Check-In & AI Chat</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-pink-400 shrink-0" />
              <span class="text-slate-300 text-sm">Daily Digital Twin AI</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-pink-400 shrink-0" />
              <span class="text-slate-300 text-sm">Glycogen Fuel Tank</span>
            </li>
          </ul>
          <UButton
            block
            size="xl"
            class="bg-pink-500 hover:bg-pink-400 text-white font-bold uppercase shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all relative z-10"
          >
            Apply for Unlock
          </UButton>
        </div>

        <!-- Tier 3: UNLEASH -->
        <div
          class="pricing-card bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-700 p-8 flex flex-col transition-all duration-300 hover:border-slate-500 shadow-sm group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-linear-to-b from-purple-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-0"
          ></div>
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
            style="
              background: radial-gradient(
                600px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(168, 85, 247, 0.1),
                transparent 40%
              );
            "
          ></div>
          <div class="mb-6 relative z-10">
            <span class="text-purple-400 font-semibold text-sm uppercase tracking-wide">Elite</span>
            <div class="mt-4 flex items-baseline gap-2 mb-2">
              <span class="text-4xl font-bold text-white">$550</span>
              <span class="text-slate-400">/mo</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-2 uppercase tracking-wide">UNLEASH</h3>
            <p class="text-sm text-slate-400">
              For those pushing the absolute limits of human endurance.
            </p>
          </div>
          <ul class="space-y-4 mb-8 grow relative z-10">
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-purple-400 shrink-0" />
              <span class="text-slate-300 text-sm">Elite Telemetry</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-purple-400 shrink-0" />
              <span class="text-slate-300 text-sm">Live Energy Availability</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-purple-400 shrink-0" />
              <span class="text-slate-300 text-sm">Performance Scores</span>
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-purple-400 shrink-0" />
              <span class="text-slate-300 text-sm">Executive AI Reports</span>
            </li>
          </ul>
          <UButton
            block
            size="xl"
            variant="outline"
            color="neutral"
            class="text-white border-slate-600 hover:bg-slate-800 font-bold uppercase bg-slate-900/50 relative z-10"
          >
            Apply for Unleash
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue'

  const handleMouseMove = (e: MouseEvent) => {
    if (typeof document === 'undefined') return
    const cards = document.querySelectorAll('.pricing-card')
    for (const card of Array.from(cards)) {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      ;(card as HTMLElement).style.setProperty('--mouse-x', `${x}px`)
      ;(card as HTMLElement).style.setProperty('--mouse-y', `${y}px`)
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove)
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  })
</script>
