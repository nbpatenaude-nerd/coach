<template>
  <section class="py-24 relative z-10">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-20">
        <h2
          class="font-athletic text-4xl sm:text-6xl font-bold uppercase text-white mb-6 tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          The Journey
          <span
            class="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-teal-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >Ecosystem</span
          >
        </h2>
        <p class="text-lg text-slate-300 max-w-2xl mx-auto">
          From community support to elite telemetry and performance analysis. Select the coaching
          module that fits your commitment level.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <!-- Tier 1: UNCOVER -->
        <div
          class="pricing-card bg-[rgba(10,15,30,0.6)] backdrop-blur-xl rounded-[2rem] border border-cyan-500/20 p-8 flex flex-col transition-all duration-500 hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)] shadow-[0_4px_20px_rgba(0,0,0,0.5)] group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
            style="
              background: radial-gradient(
                800px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(34, 211, 238, 0.08),
                transparent 40%
              );
            "
          ></div>

          <div class="relative z-10 flex flex-col h-full">
            <div class="flex items-center gap-4 mb-6">
              <span class="text-cyan-400 font-bold text-xs tracking-[0.2em]">TIER 01</span>
              <span
                class="text-xs text-slate-400 border border-slate-700/50 rounded-full px-3 py-1 bg-slate-800/30"
                >FOUNDATIONAL</span
              >
            </div>

            <h3
              class="text-4xl font-bold text-white mb-2 tracking-tight group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300"
            >
              UNCOVER
            </h3>
            <div class="flex items-baseline gap-2 mb-6">
              <span class="text-2xl font-bold text-cyan-100"></span
              ><span class="text-sm text-cyan-500/70">/mo</span>
            </div>

            <p class="text-sm text-slate-300 leading-relaxed mb-10">
              Perfect for athletes looking for structured programming and community support. Get the
              baseline you need to succeed.
            </p>

            <div class="flex flex-col gap-4 mb-12 text-sm grow">
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-cyan-500/60 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Focus</span
                >
                <span class="text-slate-200">Structured Team Program</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-cyan-500/60 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Support</span
                >
                <span class="text-slate-200">Weekly Check-In & Group Q&A</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-cyan-500/60 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Tools</span
                >
                <span class="text-slate-200">Team Dashboard Access</span>
              </div>
            </div>

            <UButton
              block
              size="xl"
              class="rounded-full bg-linear-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold border-none hover:from-cyan-300 hover:to-blue-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all duration-300 uppercase tracking-widest py-4 mt-auto"
            >
              Start Uncover &rarr;
            </UButton>
          </div>
        </div>

        <!-- Tier 2: UNLOCK -->
        <div
          class="pricing-card bg-[rgba(10,15,30,0.6)] backdrop-blur-xl rounded-[2rem] border border-pink-500/40 p-8 flex flex-col transition-all duration-500 shadow-[0_0_30px_rgba(236,72,153,0.15)] hover:shadow-[0_0_50px_rgba(236,72,153,0.3)] hover:border-pink-400/80 group relative overflow-hidden md:-translate-y-4"
        >
          <div
            class="absolute inset-0 opacity-100 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
            style="
              background: radial-gradient(
                800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
                rgba(236, 72, 153, 0.1),
                transparent 50%
              );
            "
          ></div>

          <div class="relative z-10 flex flex-col h-full">
            <div class="flex items-center gap-4 mb-6">
              <span class="text-pink-400 font-bold text-xs tracking-[0.2em]">TIER 02</span>
              <span
                class="text-xs text-pink-200 border border-pink-500/30 rounded-full px-3 py-1 bg-pink-500/10 shadow-[0_0_10px_rgba(236,72,153,0.2)]"
                >MOST POPULAR</span
              >
            </div>

            <h3
              class="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-300"
            >
              UNLOCK
            </h3>
            <div class="flex items-baseline gap-2 mb-6">
              <span class="text-2xl font-bold text-pink-100">Apply to Join</span>
            </div>

            <p class="text-sm text-slate-300 leading-relaxed mb-10">
              Comprehensive daily coaching, deep data analysis, and direct access to your dedicated
              AI and human coach.
            </p>

            <div class="flex flex-col gap-4 mb-12 text-sm grow">
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-pink-500/70 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Engine</span
                >
                <span class="text-slate-200">Daily Digital Twin AI</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-pink-500/70 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Feedback</span
                >
                <span class="text-slate-200">Daily Check-In & AI Chat</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-pink-500/70 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Metrics</span
                >
                <span class="text-slate-200">Glycogen Fuel Tank Tracking</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span class="text-pink-500/70 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Human</span
                >
                <span class="text-slate-200">Custom 1:1 Coaching</span>
              </div>
            </div>

            <UButton
              to="https://app.reclaim.ai/m/Coach-Nick/20min-quick-meeting"
              target="_blank"
              block
              size="xl"
              class="rounded-full bg-linear-to-r from-pink-500 to-rose-400 text-white font-bold border-none hover:from-pink-400 hover:to-rose-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all duration-300 uppercase tracking-widest py-4 mt-auto"
            >
              Apply for Unlock &rarr;
            </UButton>
          </div>
        </div>

        <!-- Tier 3: UNLEASH -->
        <div
          class="pricing-card bg-[rgba(10,15,30,0.6)] backdrop-blur-xl rounded-[2rem] border border-purple-500/20 p-8 flex flex-col transition-all duration-500 hover:border-purple-400/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] shadow-[0_4px_20px_rgba(0,0,0,0.5)] group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
            style="
              background: radial-gradient(
                800px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(168, 85, 247, 0.08),
                transparent 40%
              );
            "
          ></div>

          <div class="relative z-10 flex flex-col h-full">
            <div class="flex items-center gap-4 mb-6">
              <span class="text-purple-400 font-bold text-xs tracking-[0.2em]">TIER 03</span>
              <span
                class="text-xs text-slate-400 border border-slate-700/50 rounded-full px-3 py-1 bg-slate-800/30"
                >INVITE ONLY</span
              >
            </div>

            <h3
              class="text-4xl font-bold text-white mb-2 tracking-tight group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300"
            >
              UNLEASH
            </h3>
            <div class="flex items-baseline gap-2 mb-6">
              <span class="text-2xl font-bold text-purple-100">Waitlist</span>
            </div>

            <p class="text-sm text-slate-300 leading-relaxed mb-10">
              For those pushing the absolute limits of human endurance. Elite performance
              monitoring.
            </p>

            <div class="flex flex-col gap-4 mb-12 text-sm grow">
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span
                  class="text-purple-500/60 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Telemetry</span
                >
                <span class="text-slate-200">Elite Biometric Streaming</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span
                  class="text-purple-500/60 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Energy</span
                >
                <span class="text-slate-200">Live Energy Availability</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span
                  class="text-purple-500/60 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Scores</span
                >
                <span class="text-slate-200">Advanced Readiness Metrics</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-start">
                <span
                  class="text-purple-500/60 tracking-widest text-[10px] font-bold uppercase mt-1"
                  >Reports</span
                >
                <span class="text-slate-200">Executive AI Briefings</span>
              </div>
            </div>

            <UButton
              to="https://app.reclaim.ai/m/Coach-Nick/20min-quick-meeting"
              target="_blank"
              block
              size="xl"
              class="rounded-full bg-slate-800 text-purple-300 font-bold border border-purple-500/30 hover:bg-purple-900/40 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:text-purple-100 transition-all duration-300 uppercase tracking-widest py-4 mt-auto"
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
