<template>
  <UModal v-model:open="isOpen" title="Quick Add Workout" :ui="{ content: 'sm:max-w-sm' }">
    <template #body>
      <div class="space-y-3 p-4">
        <p class="text-sm text-gray-500 mb-4 text-center">
          How would you like to add a workout for {{ formattedDate }}?
        </p>
        <UButton
          block
          icon="i-heroicons-bookmark-square"
          size="lg"
          color="neutral"
          variant="soft"
          @click="selectManual"
        >
          Add from Library
        </UButton>
        <UButton block icon="i-heroicons-sparkles" size="lg" color="primary" @click="selectAI">
          Generate with AI
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useFormat } from '~/composables/useFormat'

  const props = defineProps<{ open: boolean; date?: Date | null }>()
  const emit = defineEmits(['update:open', 'manual', 'ai'])
  const { formatDateUTC } = useFormat()

  const isOpen = computed({
    get: () => props.open,
    set: (val) => emit('update:open', val)
  })

  const formattedDate = computed(() => {
    if (!props.date) return ''
    return formatDateUTC(props.date, 'MMM d, yyyy')
  })

  function selectManual() {
    isOpen.value = false
    emit('manual', props.date)
  }

  function selectAI() {
    isOpen.value = false
    emit('ai', props.date)
  }
</script>
