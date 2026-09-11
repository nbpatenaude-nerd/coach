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
          class="pricing-card bg-[rgba(15,20,35,0.4)] backdrop-blur-2xl rounded-[2rem] border border-slate-700/50 p-8 flex flex-col items-center text-center transition-all duration-700 hover:border-slate-500/50 hover:shadow-[0_10px_40px_rgba(255,255,255,0.03)] shadow-xl group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-0"
            style="
              background: radial-gradient(
                1000px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(226, 232, 240, 0.05),
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
                rgba(255, 255, 255, 0.03),
                transparent 50%
              );
              mix-blend-mode: overlay;
            "
          ></div>
          <div
            class="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-8 text-slate-300 group-hover:scale-110 group-hover:text-white transition-all duration-700 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] relative z-10"
          >
            <UIcon name="i-heroicons-bolt" class="w-8 h-8" />
          </div>
          <h3
            class="text-2xl font-bold text-white mb-4 tracking-tight uppercase transition-all duration-500 relative z-10"
          >
            Triathlon
          </h3>
          <p class="text-sm text-slate-400 leading-relaxed mb-8 flex-grow relative z-10">
            From your first sprint to mastering the Ironman distance. Data-driven programming to
            optimize your swim, bike, and run.
          </p>
          <UButton
            variant="ghost"
            class="rounded-full font-bold tracking-widest uppercase text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-500 px-6 py-2 relative z-10"
            >Explore Path &rarr;</UButton
          >
        </div>

        <!-- HYROX -->
        <div
          class="pricing-card bg-[rgba(15,20,35,0.5)] backdrop-blur-2xl rounded-[2rem] border border-cyan-800/60 p-8 flex flex-col items-center text-center transition-all duration-700 shadow-[0_10px_40px_rgba(34,211,238,0.03)] hover:shadow-[0_15px_50px_rgba(34,211,238,0.08)] hover:border-cyan-600/50 group relative overflow-hidden md:-translate-y-4"
        >
          <div
            class="absolute inset-0 opacity-100 transition-opacity duration-1000 pointer-events-none z-0"
            style="
              background: radial-gradient(
                1000px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
                rgba(186, 230, 253, 0.05),
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
                rgba(255, 255, 255, 0.04),
                transparent 50%
              );
              mix-blend-mode: overlay;
            "
          ></div>
          <div
            class="w-16 h-16 bg-cyan-900/30 rounded-2xl flex items-center justify-center mb-8 text-cyan-200 group-hover:scale-110 group-hover:text-cyan-100 transition-all duration-700 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)] relative z-10"
          >
            <UIcon name="i-heroicons-fire" class="w-8 h-8" />
          </div>
          <h3
            class="text-2xl font-bold text-white mb-4 tracking-tight uppercase transition-all duration-500 relative z-10"
          >
            HYROX
          </h3>
          <p class="text-sm text-slate-300 leading-relaxed mb-8 flex-grow relative z-10">
            Combine functional strength with raw aerobic engine. Specific race-simulation workouts
            to dominate the Roxzone.
          </p>
          <UButton
            variant="ghost"
            class="rounded-full font-bold tracking-widest uppercase text-cyan-200 hover:text-white hover:bg-cyan-800/40 transition-all duration-500 px-6 py-2 relative z-10"
            >Explore Path &rarr;</UButton
          >
        </div>

        <!-- Running -->
        <div
          class="pricing-card bg-[rgba(15,20,35,0.4)] backdrop-blur-2xl rounded-[2rem] border border-slate-700/50 p-8 flex flex-col items-center text-center transition-all duration-700 hover:border-slate-500/50 hover:shadow-[0_10px_40px_rgba(255,255,255,0.03)] shadow-xl group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-0"
            style="
              background: radial-gradient(
                1000px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(226, 232, 240, 0.05),
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
                rgba(255, 255, 255, 0.03),
                transparent 50%
              );
              mix-blend-mode: overlay;
            "
          ></div>
          <div
            class="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-8 text-slate-300 group-hover:scale-110 group-hover:text-white transition-all duration-700 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] relative z-10"
          >
            <UIcon name="i-lucide-footprints" class="w-8 h-8" />
          </div>
          <h3
            class="text-2xl font-bold text-white mb-4 tracking-tight uppercase transition-all duration-500 relative z-10"
          >
            Endurance Running
          </h3>
          <p class="text-sm text-slate-400 leading-relaxed mb-8 flex-grow relative z-10">
            5K to Ultramarathon. Smart volume progression and polarized training to build your
            aerobic base without breaking down.
          </p>
          <UButton
            variant="ghost"
            class="rounded-full font-bold tracking-widest uppercase text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-500 px-6 py-2 relative z-10"
            >Explore Path &rarr;</UButton
          >
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
