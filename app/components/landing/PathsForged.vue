<template>
  <section class="py-24 bg-transparent overflow-hidden">
    <div class="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row justify-between items-end mb-16 gap-6">
        <div class="max-w-2xl">
          <h2 class="font-athletic text-4xl sm:text-5xl font-bold uppercase text-white mb-4">
            Featured <span class="text-cyan-400">Programs</span>
          </h2>
          <p class="text-lg text-slate-400">
            Scientifically structured Training Peaks plans designed for your next PR.
            {{ interestText }}
          </p>
        </div>
        <UButton
          to="/programs"
          color="neutral"
          variant="ghost"
          class="text-white whitespace-nowrap px-6 border border-white/20 hover:bg-white/10"
        >
          View All Plans &rarr;
        </UButton>
      </div>

      <!-- Carousel for Featured Plans -->
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
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { trainingPlans } from '../../data/training-plans'

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
</script>
