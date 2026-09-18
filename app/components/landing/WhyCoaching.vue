<template>
  <section class="py-12 md:py-16 relative overflow-hidden z-10 bg-slate-950/20">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      <div class="text-center max-w-4xl mx-auto mb-10">
        <h2
          class="font-athletic text-4xl sm:text-5xl font-bold uppercase text-white mb-6 tracking-wide drop-shadow-sm"
        >
          Coaches don't just tell you what to do, they tell you how and why.
        </h2>
        <p class="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Working with a Coach is more than just a training program. They're a resource, an
          experienced human that can contextualize the training you're going through. They have
          experience training and racing, and know what it takes to achieve big changes.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Aerobic Response Rate -->
        <div
          class="coaching-card bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl border border-cyan-900/30 flex flex-col hover:border-cyan-500/50 transition-colors shadow-lg group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-0"
            style="
              background: radial-gradient(
                1000px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(34, 211, 238, 0.03),
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
                rgba(255, 255, 255, 0.02),
                transparent 50%
              );
              mix-blend-mode: overlay;
            "
          ></div>
          <div class="relative z-10 flex flex-col h-full">
            <div class="w-12 h-12 rounded-lg bg-cyan-950 flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-cyan-400" />
            </div>
            <h3 class="font-bold text-xl text-white mb-4 uppercase tracking-wide">
              Aerobic Response Rate
            </h3>
            <p class="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
              In a study on Response Rate, there was a ~42% response rate in the self-guided generic
              training group vs a <strong class="text-cyan-400">100% response rate</strong> via
              individualized threshold targeting.
            </p>
            <div class="text-xs text-slate-600 italic">
              Wolpern, A. E., et al. (2015). Is a threshold-based model a superior method... BMC
              Sports Science, Medicine and Rehabilitation, 7.
            </div>
          </div>
        </div>

        <!-- Cardiovascular Adaptation -->
        <div
          class="coaching-card bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl border border-cyan-900/30 flex flex-col hover:border-cyan-500/50 transition-colors shadow-lg group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-0"
            style="
              background: radial-gradient(
                1000px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(34, 211, 238, 0.03),
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
                rgba(255, 255, 255, 0.02),
                transparent 50%
              );
              mix-blend-mode: overlay;
            "
          ></div>
          <div class="relative z-10 flex flex-col h-full">
            <div class="w-12 h-12 rounded-lg bg-cyan-950 flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-heart" class="w-6 h-6 text-cyan-400" />
            </div>
            <h3 class="font-bold text-xl text-white mb-4 uppercase tracking-wide">
              Cardiovascular Adaptation
            </h3>
            <p class="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
              Coached individuals experienced a significantly greater improvement in aerobic
              capacity/VO2 Max (<strong class="text-cyan-400">7% improvement</strong>) compared to
              the self-guided group (0.3% improvement).
            </p>
            <div class="text-xs text-slate-600 italic">
              Storer, T. W., et al. (2014). Effect of Supervised, Periodized Exercise Training vs.
              Self-Directed Training... Journal of Strength and Conditioning Research, 28.
            </div>
          </div>
        </div>

        <!-- Adherence & Retention -->
        <div
          class="coaching-card bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl border border-cyan-900/30 flex flex-col hover:border-cyan-500/50 transition-colors shadow-lg group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-0"
            style="
              background: radial-gradient(
                1000px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(34, 211, 238, 0.03),
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
                rgba(255, 255, 255, 0.02),
                transparent 50%
              );
              mix-blend-mode: overlay;
            "
          ></div>
          <div class="relative z-10 flex flex-col h-full">
            <div class="w-12 h-12 rounded-lg bg-cyan-950 flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-cyan-400" />
            </div>
            <h3 class="font-bold text-xl text-white mb-4 uppercase tracking-wide">
              Adherence & Retention
            </h3>
            <p class="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
              Individuals experience significant increase in compliance and completion rates when
              training with an Individualized program.
            </p>
            <div class="text-xs text-slate-600 italic">
              Collado-Mateo, D., et al. (2021). Key Factors Associated with Adherence to Physical
              Exercise... International Journal of Environmental Research and Public Health, 18.
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
    const cards = document.querySelectorAll('.coaching-card')
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
