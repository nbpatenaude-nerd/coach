<template>
  <section class="py-24 relative overflow-hidden z-10">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      <div class="text-center max-w-3xl mx-auto mb-20">
        <h2
          class="font-athletic text-4xl sm:text-6xl font-bold uppercase text-white mb-6 tracking-wide drop-shadow-sm"
        >
          Choose Your
          <span class="text-transparent bg-clip-text bg-linear-to-r from-slate-200 to-slate-400"
            >Quest</span
          >
        </h2>
        <p class="text-lg text-slate-400 max-w-2xl mx-auto">
          We specialize in turning athletic potential into podium reality. Select your path and
          let's start the journey.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <!-- Triathlon -->
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

          <div class="relative z-10 flex flex-col h-full items-start text-left">
            <div class="flex items-center gap-4 mb-6">
              <span class="text-slate-400 font-bold text-xs tracking-[0.2em] font-mono"
                >PATH 01</span
              >
              <span
                class="text-xs text-slate-400 border border-slate-700 rounded-full px-3 py-1 bg-transparent tracking-widest"
                >MULTISPORT</span
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
              TRIATHLON
            </h3>
            <p class="text-sm font-bold text-slate-500 mb-8 tracking-widest uppercase">
              Swim Bike Run
            </p>

            <p class="text-sm text-slate-300 leading-relaxed mb-8 flex-grow">
              From your first sprint to mastering the Ironman distance. Data-driven programming to
              optimize your swim, bike, and run.
            </p>
            <div class="w-full flex justify-start mt-auto">
              <UButton
                class="rounded-full bg-slate-800 text-slate-200 font-bold border border-slate-700 hover:bg-slate-700 hover:text-white transition-all duration-300 uppercase tracking-widest px-8 py-3"
                >Explore Path &rarr;</UButton
              >
            </div>
          </div>
        </div>

        <!-- HYROX -->
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

          <div class="relative z-10 flex flex-col h-full items-start text-left">
            <div class="flex items-center gap-4 mb-6">
              <span class="text-cyan-500/70 font-bold text-xs tracking-[0.2em] font-mono"
                >PATH 02</span
              >
              <span
                class="text-xs text-cyan-500/70 border border-cyan-800/50 rounded-full px-3 py-1 bg-transparent tracking-widest"
                >FUNCTIONAL</span
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
              HYROX
            </h3>
            <p class="text-sm font-bold text-slate-500 mb-8 tracking-widest uppercase">
              Fitness Racing
            </p>

            <p class="text-sm text-slate-300 leading-relaxed mb-8 flex-grow">
              Combine functional strength with raw aerobic engine. Specific race-simulation workouts
              to dominate the Roxzone.
            </p>
            <div class="w-full flex justify-start mt-auto">
              <UButton
                class="rounded-full bg-slate-800 text-cyan-100 font-bold border border-cyan-900/50 hover:bg-slate-700 hover:text-white transition-all duration-300 uppercase tracking-widest px-8 py-3"
                >Explore Path &rarr;</UButton
              >
            </div>
          </div>
        </div>

        <!-- Running -->
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

          <div class="relative z-10 flex flex-col h-full items-start text-left">
            <div class="flex items-center gap-4 mb-6">
              <span class="text-slate-400 font-bold text-xs tracking-[0.2em] font-mono"
                >PATH 03</span
              >
              <span
                class="text-xs text-slate-400 border border-slate-700 rounded-full px-3 py-1 bg-transparent tracking-widest"
                >ENDURANCE</span
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
              RUNNING
            </h3>
            <p class="text-sm font-bold text-slate-500 mb-8 tracking-widest uppercase">
              5K To Ultra
            </p>

            <p class="text-sm text-slate-300 leading-relaxed mb-8 flex-grow">
              5K to Ultramarathon. Smart volume progression and polarized training to build your
              aerobic base without breaking down.
            </p>
            <div class="w-full flex justify-start mt-auto">
              <UButton
                class="rounded-full bg-slate-800 text-slate-200 font-bold border border-slate-700 hover:bg-slate-700 hover:text-white transition-all duration-300 uppercase tracking-widest px-8 py-3"
                >Explore Path &rarr;</UButton
              >
            </div>
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
