<template>
  <UModal v-model:open="isOpen" class="sm:max-w-7xl">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          Today's Wellness Check
        </h3>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark-20-solid"
          class="-my-1"
          @click="isOpen = false"
        />
      </div>
    </template>
    <template #body>
      <div class="flex flex-col gap-6 lg:flex-row p-4 min-h-[60vh]">
        <div
          class="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 pb-6 lg:pb-0 lg:pr-6 overflow-y-auto max-h-[75vh]"
        >
          <WellnessModalInner :date="date" :open="open" />
        </div>
        <div class="w-full lg:w-1/2 overflow-y-auto max-h-[75vh]">
          <DailyCheckinModalInner :date="date" @close="isOpen = false" />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import WellnessModalInner from './WellnessModalInner.vue'
  import DailyCheckinModalInner from './DailyCheckinModalInner.vue'

  const props = defineProps<{
    open: boolean
    date?: Date | null
  }>()

  const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
  }>()

  const isOpen = computed({
    get: () => props.open,
    set: (val) => emit('update:open', val)
  })
</script>
