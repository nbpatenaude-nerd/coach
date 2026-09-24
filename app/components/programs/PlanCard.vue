<template>
  <div
    class="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-lg flex flex-col h-full group hover:border-cyan-500/50 transition-colors duration-300"
  >
    <!-- Card Header / Image Placeholder -->
    <div class="h-48 bg-slate-900 relative overflow-hidden flex items-center justify-center">
      <div v-if="plan.image" class="absolute inset-0">
        <img
          :src="plan.image"
          :alt="plan.title"
          class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div v-else class="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>

      <!-- Badges -->
      <div class="absolute top-4 left-4 flex gap-2">
        <span
          class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 text-white backdrop-blur-sm border border-white/10"
        >
          {{ plan.category }}
        </span>
      </div>
      <div class="absolute top-4 right-4">
        <span
          :class="levelColorClass"
          class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-sm border border-white/10"
        >
          {{ plan.level }}
        </span>
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-6 flex flex-col flex-grow">
      <h3
        class="text-xl font-bold text-white mb-2 leading-tight group-hover:text-cyan-400 transition-colors"
      >
        {{ plan.title }}
      </h3>

      <div class="flex items-center gap-4 text-sm text-slate-400 mb-4">
        <div class="flex items-center gap-1.5">
          <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
          <span>{{ plan.duration }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <UIcon name="i-heroicons-clock" class="w-4 h-4" />
          <span>{{ plan.hoursPerWeek }}</span>
        </div>
      </div>

      <p class="text-slate-300 text-sm leading-relaxed mb-8 flex-grow">
        {{ plan.description }}
      </p>

      <UButton
        :to="plan.trainingPeaksUrl"
        target="_blank"
        color="primary"
        variant="solid"
        class="w-full justify-center font-bold uppercase tracking-widest text-xs py-3"
      >
        View on Training Peaks
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { TrainingPlan } from '../../data/training-plans'

  const props = defineProps<{
    plan: TrainingPlan
  }>()

  const levelColorClass = computed(() => {
    switch (props.plan.level) {
      case 'Beginner':
        return 'text-emerald-400'
      case 'Intermediate':
        return 'text-amber-400'
      case 'Advanced':
        return 'text-rose-400'
      default:
        return 'text-white'
    }
  })
</script>
