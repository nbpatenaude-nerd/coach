<template>
  <section ref="statsSection" class="relative z-10 py-12 sm:py-20">
    <div class="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/20">
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="flex flex-col items-center justify-center text-center px-4"
        >
          <div
            class="font-athletic text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-2"
          >
            {{ displayValues[index] }}{{ stat.suffix }}
          </div>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div
            class="text-xs sm:text-sm font-medium tracking-[0.2em] text-slate-400 uppercase max-w-[200px]"
            v-html="stat.label"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, watch } from 'vue'
  import { useElementVisibility } from '@vueuse/core'

  const statsSection = ref(null)
  const isVisible = useElementVisibility(statsSection)
  const hasAnimated = ref(false)

  const stats = [
    { target: 100, suffix: '+', label: 'ATHLETES COACHED' },
    { target: 12, suffix: '+', label: 'WORLD CHAMPIONSHIPS<br>ATTENDED' },
    { target: 5, suffix: '+', label: 'PROVINCIAL/NATIONAL<br>TITLES ACHIEVED' },
    { target: 13, suffix: '', label: 'YEARS COACHING<br>EXPERIENCE' }
  ]

  const displayValues = ref(stats.map(() => 0))

  const animateValues = () => {
    if (hasAnimated.value) return
    hasAnimated.value = true

    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      // Ease out quad
      const easeProgress = progress * (2 - progress)

      stats.forEach((stat, index) => {
        displayValues.value[index] = Math.round(easeProgress * stat.target)
      })

      if (currentStep >= steps) {
        clearInterval(interval)
        // Ensure final values are exact
        stats.forEach((stat, index) => {
          displayValues.value[index] = stat.target
        })
      }
    }, stepDuration)
  }

  watch(isVisible, (visible) => {
    if (visible) {
      animateValues()
    }
  })
</script>
