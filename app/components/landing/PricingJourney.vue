<template>
  <section class="py-24 relative z-10">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-20">
        <h2
          class="font-athletic text-4xl sm:text-6xl font-bold uppercase text-white mb-6 tracking-wide drop-shadow-sm"
        >
          The Journey
          <span class="text-transparent bg-clip-text bg-linear-to-r from-slate-200 to-slate-400"
            >Ecosystem</span
          >
        </h2>
        <p class="text-lg text-slate-400 max-w-2xl mx-auto">
          From community support to elite telemetry and performance analysis. Select the coaching
          module that fits your commitment level.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <!-- Tier 1: UNCOVER -->
        <div
          class="pricing-card bg-[rgba(15,20,30,0.6)] backdrop-blur-2xl rounded-[2rem] border border-slate-700/40 p-8 flex flex-col transition-all duration-700 hover:border-slate-500/50 hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] shadow-xl group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-0"
            style="
              background: radial-gradient(
                1000px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(200, 220, 240, 0.02),
                transparent 40%
              );
              mix-blend-mode: screen;
            "
          ></div>
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
            style="
              background: radial-gradient(
                400px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(255, 255, 255, 0.01),
                transparent 50%
              );
              mix-blend-mode: overlay;
            "
          ></div>

          <div class="relative z-10 flex flex-col h-full">
            <div class="flex items-center gap-4 mb-6">
              <span class="text-slate-400 font-bold text-xs tracking-[0.2em] font-mono"
                >TIER 01</span
              >
              <span
                class="text-xs text-slate-400 border border-slate-700/50 rounded-full px-3 py-1 bg-slate-800/30"
                >FOUNDATIONAL</span
              >
            </div>

            <h3
              class="font-black text-4xl sm:text-5xl text-white mb-2 tracking-wide uppercase transition-all duration-500 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
              style="
                font-family:
                  system-ui,
                  -apple-system,
                  sans-serif;
                font-stretch: expanded;
              "
            >
              UNCOVER
            </h3>
            <div class="flex items-baseline gap-2 mb-6">
              <span class="text-2xl font-bold text-slate-200"></span
              ><span class="text-sm text-slate-500">/mo</span>
            </div>

            <p class="text-sm text-slate-400 leading-relaxed mb-10">
              Perfect for athletes looking for structured programming and community support. Get the
              baseline you need to succeed.
            </p>

            <div class="flex flex-col gap-4 mb-12 text-sm grow">
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-slate-500 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Focus</span
                >
                <span class="text-slate-300">Structured Team Program</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-slate-500 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Support</span
                >
                <span class="text-slate-300">Weekly Check-In & Group Q&A</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-slate-500 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Tools</span
                >
                <span class="text-slate-300">Team Dashboard Access</span>
              </div>
            </div>

            <UButton
              block
              size="xl"
              class="rounded-full bg-slate-800 text-slate-200 font-bold border border-slate-700 hover:bg-slate-700 hover:text-white transition-all duration-300 uppercase tracking-widest py-4 mt-auto"
            >
              Start Uncover &rarr;
            </UButton>
          </div>
        </div>

        <!-- Tier 2: UNLOCK -->
        <div
          class="pricing-card bg-[rgba(15,20,30,0.6)] backdrop-blur-2xl rounded-[2rem] border border-cyan-900/40 p-8 flex flex-col transition-all duration-700 shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.4)] hover:border-cyan-700/50 group relative overflow-hidden md:-translate-y-4"
        >
          <div
            class="absolute inset-0 opacity-100 transition-opacity duration-1000 pointer-events-none z-0"
            style="
              background: radial-gradient(
                1000px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
                rgba(186, 230, 253, 0.02),
                transparent 50%
              );
              mix-blend-mode: screen;
            "
          ></div>
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
            style="
              background: radial-gradient(
                500px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
                rgba(255, 255, 255, 0.02),
                transparent 50%
              );
              mix-blend-mode: overlay;
            "
          ></div>

          <div class="relative z-10 flex flex-col h-full">
            <div class="flex items-center gap-4 mb-6">
              <span class="text-cyan-500/70 font-bold text-xs tracking-[0.2em] font-mono"
                >TIER 02</span
              >
              <span
                class="text-xs text-cyan-500/70 border border-cyan-800/50 rounded-full px-3 py-1 bg-cyan-900/20"
                >MOST POPULAR</span
              >
            </div>

            <h3
              class="font-black text-4xl sm:text-5xl text-white mb-2 tracking-wide uppercase transition-all duration-500 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
              style="
                font-family:
                  system-ui,
                  -apple-system,
                  sans-serif;
                font-stretch: expanded;
              "
            >
              UNLOCK
            </h3>
            <div class="flex items-baseline gap-2 mb-6">
              <span class="text-2xl font-bold text-cyan-50">Apply to Join</span>
            </div>

            <p class="text-sm text-slate-300 leading-relaxed mb-10">
              Comprehensive daily coaching, deep data analysis, and direct access to your dedicated
              AI and human coach.
            </p>

            <div class="flex flex-col gap-4 mb-12 text-sm grow">
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-cyan-600/70 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Focus</span
                >
                <span class="text-slate-200">Individualized Training Plan</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-cyan-600/70 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Support</span
                >
                <span class="text-slate-200">1:1 Coach & Daily AI Chat</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-cyan-600/70 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Tools</span
                >
                <span class="text-slate-200">Digital Twin & Fuel Tracking</span>
              </div>
            </div>

            <UButton
              to="https://app.reclaim.ai/m/Coach-Nick/20min-quick-meeting"
              target="_blank"
              block
              size="xl"
              class="rounded-full bg-slate-800 text-cyan-100 font-bold border border-cyan-900/50 hover:bg-slate-700 hover:text-white transition-all duration-300 uppercase tracking-widest py-4 mt-auto"
            >
              Apply for Unlock &rarr;
            </UButton>
          </div>
        </div>

        <!-- Tier 3: UNLEASH -->
        <div
          class="pricing-card bg-[rgba(15,20,30,0.6)] backdrop-blur-2xl rounded-[2rem] border border-slate-700/40 p-8 flex flex-col transition-all duration-700 hover:border-slate-500/50 hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] shadow-xl group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-0"
            style="
              background: radial-gradient(
                1000px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(200, 220, 240, 0.02),
                transparent 40%
              );
              mix-blend-mode: screen;
            "
          ></div>
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
            style="
              background: radial-gradient(
                400px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(255, 255, 255, 0.01),
                transparent 50%
              );
              mix-blend-mode: overlay;
            "
          ></div>

          <div class="relative z-10 flex flex-col h-full">
            <div class="flex items-center gap-4 mb-6">
              <span class="text-slate-400 font-bold text-xs tracking-[0.2em] font-mono"
                >TIER 03</span
              >
              <span
                class="text-xs text-slate-400 border border-slate-700/50 rounded-full px-3 py-1 bg-slate-800/30"
                >INVITE ONLY</span
              >
            </div>

            <h3
              class="font-black text-4xl sm:text-5xl text-white mb-2 tracking-wide uppercase transition-all duration-500 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
              style="
                font-family:
                  system-ui,
                  -apple-system,
                  sans-serif;
                font-stretch: expanded;
              "
            >
              UNLEASH
            </h3>
            <div class="flex items-baseline gap-2 mb-6">
              <span class="text-2xl font-bold text-slate-200">Waitlist</span>
            </div>

            <p class="text-sm text-slate-400 leading-relaxed mb-10">
              For those pushing the absolute limits of human endurance. Elite performance
              monitoring.
            </p>

            <div class="flex flex-col gap-4 mb-12 text-sm grow">
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-slate-500 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Focus</span
                >
                <span class="text-slate-300">Advanced Performance Metrics</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-slate-500 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Support</span
                >
                <span class="text-slate-300">Executive AI Briefings</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-slate-500 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Tools</span
                >
                <span class="text-slate-300">Live Telemetry & Energy Sync</span>
              </div>
            </div>

            <UButton
              to="https://app.reclaim.ai/m/Coach-Nick/20min-quick-meeting"
              target="_blank"
              block
              size="xl"
              class="rounded-full bg-slate-800/50 text-slate-300 font-bold border border-slate-700 hover:bg-slate-700 hover:text-white transition-all duration-300 uppercase tracking-widest py-4 mt-auto"
            >
              Apply for Unleash &rarr;
            </UButton>
          </div>
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
      ;(card as HTMLElement).style.setProperty('--mouse-x', x + 'px')
      ;(card as HTMLElement).style.setProperty('--mouse-y', y + 'px')
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

<style scoped>
  .font-athletic {
    font-family: 'Inter', system-ui, sans-serif;
    letter-spacing: -0.02em;
  }
</style>
