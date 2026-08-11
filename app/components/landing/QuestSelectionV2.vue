<template>
  <section ref="questSection" class="py-24 bg-transparent relative overflow-hidden">
    <!-- Background element to tie into the mountain theme -->
    <div
      ref="questBg"
      class="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply"
      style="
        background-image: url('/images/v2/swirling_clouds.png');
        background-size: cover;
        background-position: top;
      "
    ></div>

    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      <div ref="questHeader" class="text-center max-w-3xl mx-auto mb-16 opacity-0 translate-y-12">
        <h2 class="font-athletic text-4xl sm:text-5xl font-bold uppercase text-white mb-6">
          Choose Your
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400"
            >Quest</span
          >
        </h2>
        <p class="text-lg text-slate-300">
          We specialize in turning athletic potential into podium reality. Select your path and
          let's start the journey.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Triathlon -->
        <div
          class="quest-card opacity-0 translate-y-12 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-cyan-900/20 group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-0"
          ></div>
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
            style="
              background: radial-gradient(
                600px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(34, 211, 238, 0.15),
                transparent 40%
              );
            "
          ></div>
          <div
            class="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform relative z-10 shadow-sm border border-slate-700"
          >
            <UIcon name="i-heroicons-bolt" class="w-8 h-8" />
          </div>
          <h3 class="font-athletic text-2xl font-bold text-white mb-4 uppercase relative z-10">
            Triathlon
          </h3>
          <p class="text-slate-300 mb-8 flex-grow relative z-10">
            From your first sprint to mastering the Ironman distance. Data-driven programming to
            optimize your swim, bike, and run.
          </p>
          <UButton
            variant="ghost"
            class="text-white font-bold tracking-wide uppercase relative z-10 hover:bg-slate-800"
            >Explore Path</UButton
          >
        </div>

        <!-- HYROX -->
        <div
          class="quest-card opacity-0 translate-y-12 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-cyan-900/20 group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-0"
          ></div>
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
            style="
              background: radial-gradient(
                600px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(34, 211, 238, 0.15),
                transparent 40%
              );
            "
          ></div>
          <div
            class="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform relative z-10 shadow-sm border border-slate-700"
          >
            <UIcon name="i-heroicons-fire" class="w-8 h-8" />
          </div>
          <h3 class="font-athletic text-2xl font-bold text-white mb-4 uppercase relative z-10">
            HYROX
          </h3>
          <p class="text-slate-300 mb-8 flex-grow relative z-10">
            The ultimate fitness race requires the ultimate preparation. Combine running capacity
            with raw functional strength.
          </p>
          <UButton
            variant="ghost"
            class="text-white font-bold tracking-wide uppercase relative z-10 hover:bg-slate-800"
            >Explore Path</UButton
          >
        </div>

        <!-- Running -->
        <div
          class="quest-card opacity-0 translate-y-12 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-cyan-900/20 group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-0"
          ></div>
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
            style="
              background: radial-gradient(
                600px circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(34, 211, 238, 0.15),
                transparent 40%
              );
            "
          ></div>
          <div
            class="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform relative z-10 shadow-sm border border-slate-700"
          >
            <UIcon name="i-heroicons-map" class="w-8 h-8" />
          </div>
          <h3 class="font-athletic text-2xl font-bold text-white mb-4 uppercase relative z-10">
            Endurance Run
          </h3>
          <p class="text-slate-300 mb-8 flex-grow relative z-10">
            5k to Ultra-Marathon. Build an unbreakable engine with sustainable volume, targeted
            intensity, and sport psychology.
          </p>
          <UButton
            variant="ghost"
            class="text-white font-bold tracking-wide uppercase relative z-10 hover:bg-slate-800"
            >Explore Path</UButton
          >
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

  const questSection = ref<HTMLElement | null>(null)
  const questHeader = ref<HTMLElement | null>(null)
  const questBg = ref<HTMLElement | null>(null)

  let scrollTriggerInstance1: any = null
  let scrollTriggerInstance2: any = null

  const handleMouseMove = (e: MouseEvent) => {
    if (typeof document === 'undefined') return
    const cards = document.querySelectorAll('.quest-card')
    for (const card of Array.from(cards)) {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      ;(card as HTMLElement).style.setProperty('--mouse-x', `${x}px`)
      ;(card as HTMLElement).style.setProperty('--mouse-y', `${y}px`)
    }
  }

  onMounted(() => {
    if (typeof window === 'undefined') return

    window.addEventListener('mousemove', handleMouseMove)

    // Parallax the background clouds slightly
    scrollTriggerInstance1 = gsap.to(questBg.value, {
      y: 100,
      ease: 'none',
      scrollTrigger: {
        trigger: questSection.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })

    // Fade in header and stagger cards
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: questSection.value,
        start: 'top 70%' // Start when section is 30% into view
      }
    })

    scrollTriggerInstance2 = tl

    tl.to(questHeader.value, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    }).to(
      '.quest-card',
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power2.out'
      },
      '-=0.4'
    )
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', handleMouseMove)
    }
    if (scrollTriggerInstance1) scrollTriggerInstance1.scrollTrigger?.kill()
    if (scrollTriggerInstance2) scrollTriggerInstance2.scrollTrigger?.kill()
  })
</script>
