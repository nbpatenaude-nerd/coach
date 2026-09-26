<template>
  <div class="border-b border-default/60 p-3">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-[10px] font-black uppercase tracking-widest text-muted">
          {{ hasSelection ? 'Selection' : 'Entire Workout' }}
        </p>
        <p class="truncate text-sm font-black text-highlighted">
          {{ hasSelection ? selectionLabel : 'Full session' }}
        </p>
      </div>
      <UButton
        v-if="hasSelection"
        size="xs"
        color="neutral"
        variant="ghost"
        icon="i-heroicons-x-mark"
        @click="$emit('clear')"
      />
    </div>

    <div class="mt-3 grid grid-cols-2 gap-2">
      <div
        v-for="metric in metrics"
        :key="metric.label"
        class="rounded-lg border border-default/60 bg-muted/10 px-2.5 py-2"
      >
        <p class="text-[9px] font-black uppercase tracking-widest text-muted">{{ metric.label }}</p>
        <p class="text-sm font-black tabular-nums text-highlighted">{{ metric.value }}</p>
      </div>
    </div>

    <p v-if="loading" class="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary">
      Calculating segment metrics...
    </p>
    <p v-else-if="error" class="mt-2 text-[10px] font-bold uppercase tracking-widest text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    hasSelection: boolean
    selectionLabel: string
    selectionMetrics: Array<{ label: string; value: string }>
    entireMetrics: Array<{ label: string; value: string }>
    loading?: boolean
    error?: string | null
  }>()

  defineEmits<{ clear: [] }>()

  const metrics = computed(() =>
    props.hasSelection ? props.selectionMetrics : props.entireMetrics
  )
</script>
