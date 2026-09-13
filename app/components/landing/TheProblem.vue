<template>
  <section class="py-12 md:py-16 relative overflow-hidden z-10">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      <div class="text-center max-w-3xl mx-auto mb-10">
        <h2
          class="font-athletic text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl drop-shadow-md"
        >
          The Cost of <span class="text-rose-500">Guessing</span>
        </h2>
        <p class="mt-4 text-lg text-slate-300 leading-relaxed">
          Endurance sports are flooded with endless YouTube videos, generic downloadable templates,
          and conflicting advice on zones, volume, and fueling. Cut through the noise.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Card 1 -->
        <div
          class="problem-card bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-8 hover:border-rose-500/30 transition-colors shadow-lg group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-0"
            style="
              background: radial-gradient(
                1000px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(244, 63, 94, 0.03),
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
          <div class="relative z-10">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-10 h-10 text-rose-500 mb-6" />
            <h3 class="text-xl font-bold text-white mb-3">Chronic Fatigue & Injuries</h3>
            <p class="text-slate-400 leading-relaxed">
              Nagging overuse injuries in your knees, shoulders, and Achilles aren't "part of the
              process." They are the direct result of unmanaged volume and intensity.
            </p>
          </div>
        </div>

        <!-- Card 2 -->
        <div
          class="problem-card bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-8 hover:border-rose-500/30 transition-colors shadow-lg group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-0"
            style="
              background: radial-gradient(
                1000px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(244, 63, 94, 0.03),
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
          <div class="relative z-10">
            <UIcon name="i-heroicons-clock" class="w-10 h-10 text-rose-500 mb-6" />
            <h3 class="text-xl font-bold text-white mb-3">Strain on Life & Family</h3>
            <p class="text-slate-400 leading-relaxed">
              Generic plans don't care about your demanding career or family commitments. Forcing a
              rigid schedule creates burnout before you even reach the starting line.
            </p>
          </div>
        </div>

        <!-- Card 3 -->
        <div
          class="problem-card bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-8 hover:border-rose-500/30 transition-colors shadow-lg group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-0"
            style="
              background: radial-gradient(
                1000px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(244, 63, 94, 0.03),
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
          <div class="relative z-10">
            <UIcon name="i-heroicons-user-group" class="w-10 h-10 text-rose-500 mb-6" />
            <h3 class="text-xl font-bold text-white mb-3">The Age Factor</h3>
            <p class="text-slate-400 leading-relaxed">
              A high-volume plan designed for a 20-something will fail a working professional in
              their 40s and 50s. Your recovery needs and physiology require an intelligent, tailored
              approach.
            </p>
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
    const cards = document.querySelectorAll('.problem-card')
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
