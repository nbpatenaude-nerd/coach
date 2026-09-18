<template>
  <section ref="statsContainer" class="relative bg-transparent py-24 sm:py-32 overflow-hidden">
    <!-- Mountain continuation or mist overlay -->
    <div
      class="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply"
      style="
        background-image: url('/images/v2/swirling_clouds.png');
        background-size: cover;
        background-position: bottom;
      "
    ></div>

    <div class="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-800">
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="text-center px-4 stat-item opacity-0 translate-y-8"
        >
          <div class="text-4xl sm:text-5xl font-athletic font-bold text-white mb-2">
            <span ref="counters" class="inline-block" :data-target="stat.value">0</span
            >{{ stat.suffix }}
          </div>
          <div class="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">
            {{ stat.label }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'

  if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
  }

  const statsContainer = ref<HTMLElement | null>(null)
  const counters = ref<HTMLElement[]>([])

  const stats = [
    { label: 'Active Athletes', value: 1250, suffix: '+' },
    { label: 'Ironman Finishes', value: 450, suffix: '+' },
    { label: 'PRs Shattered', value: 3100, suffix: '' },
    { label: 'Years Coaching', value: 15, suffix: '+' }
  ]

  let scrollTriggerInstance: any = null

  onMounted(() => {
    if (typeof window === 'undefined') return

    // Stagger fade in for the stats items
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: statsContainer.value,
      start: 'top 80%', // When the top of the section hits 80% of the viewport height
      onEnter: () => {
        // Fade in and slide up
        gsap.to('.stat-item', {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out'
        })

        // Animate numbers
        counters.value.forEach((counter) => {
          const target = parseFloat(counter.getAttribute('data-target') || '0')
          gsap.to(counter, {
            innerHTML: target,
            duration: 2,
            ease: 'power2.out',
            snap: { innerHTML: 1 },
            stagger: {
              each: 0.2,
              onUpdate: function () {
                // Ensure it formats without decimals if needed, but snap does this mostly
                counter.innerHTML = Math.ceil(parseFloat(counter.innerHTML)).toString()
              }
            }
          })
        })
      },
      once: true // Only animate once
    })
  })

  onUnmounted(() => {
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill()
    }
  })
</script>
