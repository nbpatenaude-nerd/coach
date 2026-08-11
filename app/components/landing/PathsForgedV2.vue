<template>
  <section ref="pathsSection" class="py-24 bg-transparent overflow-hidden relative">
    <!-- Background element to tie into the mountain theme -->
    <div
      ref="pathsBg"
      class="absolute inset-0 w-[200%] opacity-10 pointer-events-none mix-blend-multiply z-0"
      style="
        background-image: url('/images/v2/swirling_clouds.png');
        background-size: cover;
        background-position: center;
        background-repeat: repeat-x;
      "
    ></div>

    <div class="max-w-352 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div
        ref="pathsHeader"
        class="flex flex-col sm:flex-row justify-between items-end mb-16 gap-6 opacity-0 translate-y-12"
      >
        <div class="max-w-2xl">
          <h2 class="font-athletic text-4xl sm:text-5xl font-bold uppercase text-white mb-4">
            Featured <span class="text-cyan-400">Programs</span>
          </h2>
          <p class="text-lg text-slate-300">
            Scientifically structured Training Peaks plans designed for your next PR.
            {{ interestText }}
          </p>
        </div>
        <UButton
          to="/programs"
          variant="ghost"
          class="text-white whitespace-nowrap px-6 border border-slate-700 hover:bg-slate-800"
        >
          View All Plans &rarr;
        </UButton>
      </div>

      <!-- Carousel for Featured Plans -->
      <div ref="pathsCarousel">
        <UCarousel
          v-slot="{ item }"
          :items="featuredPlans"
          :ui="{ item: 'basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 snap-start' }"
          arrows
          class="w-full"
        >
          <div class="p-4 h-full flex">
            <ProgramsPlanCard :plan="item" class="w-full" />
          </div>
        </UCarousel>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { trainingPlans } from '../../data/training-plans'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'

  const route = useRoute()
  const interest = computed(() => route.query.interest as string)

  const interestText = computed(() => {
    if (interest.value === 'running') return 'Here are our top running programs.'
    if (interest.value === 'triathlon') return 'Here are our top triathlon programs.'
    if (interest.value === 'cycling') return 'Here are our top cycling programs.'
    return 'Find the perfect plan for your next block.'
  })

  const featuredPlans = computed(() => {
    if (!interest.value) return trainingPlans.slice(0, 6)

    // Sort plans so the interested category comes first
    return [...trainingPlans]
      .sort((a, b) => {
        if (a.category === interest.value && b.category !== interest.value) return -1
        if (a.category !== interest.value && b.category === interest.value) return 1
        return 0
      })
      .slice(0, 6)
  })

  const pathsSection = ref<HTMLElement | null>(null)
  const pathsHeader = ref<HTMLElement | null>(null)
  const pathsCarousel = ref<HTMLElement | null>(null)
  const pathsBg = ref<HTMLElement | null>(null)

  let scrollTriggerInstance1: any = null
  let scrollTriggerInstance2: any = null
  let cloudAnimation: any = null

  onMounted(() => {
    if (typeof window === 'undefined') return
    gsap.registerPlugin(ScrollTrigger)

    // Infinite drifting cloud animation
    cloudAnimation = gsap.to(pathsBg.value, {
      xPercent: -50,
      duration: 60,
      ease: 'none',
      repeat: -1
    })

    // Parallax the background clouds slightly
    scrollTriggerInstance1 = gsap.to(pathsBg.value, {
      y: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: pathsSection.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })

    // Fade in header and clip-path reveal carousel
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pathsSection.value,
        start: 'top 70%'
      }
    })

    scrollTriggerInstance2 = tl

    tl.to(pathsHeader.value, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    })

    // Clip-path reveal for the carousel
    tl.fromTo(
      pathsCarousel.value,
      { clipPath: 'inset(20% 10% 20% 10% round 16px)', scale: 0.9, opacity: 0 },
      {
        clipPath: 'inset(0% 0% 0% 0% round 16px)',
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out'
      },
      '-=0.4'
    )
  })

  onUnmounted(() => {
    if (scrollTriggerInstance1) scrollTriggerInstance1.scrollTrigger?.kill()
    if (scrollTriggerInstance2) scrollTriggerInstance2.scrollTrigger?.kill()
    if (cloudAnimation) cloudAnimation.kill()
  })
</script>
