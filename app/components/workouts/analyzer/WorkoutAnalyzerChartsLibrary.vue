<template>
  <div class="rounded-xl border border-default/70 bg-default p-3">
    <h3 class="text-[10px] font-black uppercase tracking-widest text-muted">Charts Library</h3>
    <p class="mt-1 text-xs text-muted">Add panels to the Analyze 360 stack.</p>

    <div class="mt-4 space-y-2">
      <div
        v-for="item in catalog"
        :key="item.id"
        class="flex items-center justify-between gap-2 rounded-lg border border-default/60 px-2.5 py-2"
      >
        <div class="min-w-0">
          <div class="text-xs font-bold text-highlighted">{{ item.label }}</div>
          <div class="text-[10px] text-muted">{{ item.description }}</div>
        </div>
        <UButton
          v-if="activePanels.includes(item.id)"
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-minus"
          @click="$emit('remove', item.id)"
        />
        <UButton
          v-else
          size="xs"
          color="primary"
          variant="soft"
          icon="i-heroicons-plus"
          @click="$emit('add', item.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    activePanels: string[]
  }>()

  defineEmits<{
    add: [string]
    remove: [string]
  }>()

  const catalog = [
    {
      id: 'map',
      label: 'Map',
      description: 'GPS track with selection highlight'
    },
    {
      id: 'time-in-zones',
      label: 'Time in Zones',
      description: 'Minutes by HR / power zone'
    },
    {
      id: 'peak-curve',
      label: 'Peak Curve',
      description: 'Peak power or pace by duration'
    },
    {
      id: 'xy-scatter',
      label: 'Custom XY',
      description: 'Scatter of two stream metrics'
    },
    {
      id: 'lap-grid',
      label: 'Lap Grid',
      description: 'Use the laps table below channels'
    }
  ]
</script>
