<template>
  <div class="min-h-screen bg-slate-950 pt-32 pb-24">
    <div class="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-12">
        <h1 class="font-athletic text-5xl sm:text-6xl font-bold uppercase text-white mb-4">
          Training <span class="text-cyan-400">Programs</span>
        </h1>
        <p class="text-xl text-slate-400 max-w-3xl">
          Scientifically backed, field-tested plans for your next race. Browse our library of
          Training Peaks programs designed by elite coaches to help you reach your potential.
        </p>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-4 mb-12 border-b border-slate-800 pb-6">
        <button
          v-for="category in categories"
          :key="category.value"
          :class="[
            'px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300',
            activeCategory === category.value
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
          ]"
          @click="activeCategory = category.value"
        >
          {{ category.label }}
        </button>
      </div>

      <!-- Grid Layout -->
      <div
        v-if="filteredPlans.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <ProgramsPlanCard v-for="plan in filteredPlans" :key="plan.id" :plan="plan" />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-24 bg-slate-900/50 rounded-2xl border border-slate-800">
        <UIcon
          name="i-heroicons-clipboard-document-list"
          class="w-16 h-16 text-slate-600 mb-4 mx-auto"
        />
        <h3 class="text-2xl font-bold text-white mb-2">No programs found</h3>
        <p class="text-slate-400">
          We don't have any plans matching this category right now. Check back soon!
        </p>
        <UButton color="white" variant="outline" class="mt-6" @click="activeCategory = 'all'">
          View All Plans
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { trainingPlans } from '../../data/training-plans'

  const activeCategory = ref('all')

  const categories = [
    { label: 'All Plans', value: 'all' },
    { label: 'Running', value: 'running' },
    { label: 'Triathlon', value: 'triathlon' },
    { label: 'Cycling', value: 'cycling' },
    { label: 'Strength', value: 'strength' }
  ]

  const filteredPlans = computed(() => {
    if (activeCategory.value === 'all') {
      return trainingPlans
    }
    return trainingPlans.filter((plan) => plan.category === activeCategory.value)
  })

  useHead({
    title: 'Training Programs | Journey Endurance',
    meta: [
      {
        name: 'description',
        content:
          'Browse our library of professionally designed Training Peaks plans for running, triathlon, cycling, and strength.'
      }
    ]
  })
</script>
