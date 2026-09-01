<template>
  <USlideover v-model="isOpen">
    <UCard class="flex flex-col flex-1">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-bold text-lg">Customize Layout</h2>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark"
            class="-my-1"
            @click="
              () => {
                isOpen = false
              }
            "
          />
        </div>
      </template>

      <div class="p-4 flex-grow overflow-y-auto">
        <draggable
          v-model="localLayout"
          group="customizer"
          item-key="id"
          ghost-class="opacity-50 border-2 border-dashed border-primary-500 rounded bg-gray-50 dark:bg-gray-800"
          animation="200"
          @end="emitUpdate"
        >
          <template #item="{ element }">
            <div
              class="flex items-center gap-2 mb-3 p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 shadow-sm"
            >
              <UIcon
                name="i-heroicons-bars-3"
                class="drag-handle w-5 h-5 text-gray-400 cursor-move"
              />
              <div class="flex-grow">
                <p class="text-sm font-semibold truncate">{{ getWidgetName(element.id) }}</p>
              </div>
              <USelect
                v-model="element.class"
                :options="sizeOptions"
                option-attribute="label"
                value-attribute="value"
                size="xs"
                class="w-28"
                @change="emitUpdate"
              />
            </div>
          </template>
        </draggable>
      </div>
    </UCard>
  </USlideover>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import draggable from 'vuedraggable'

  const props = defineProps<{
    open: boolean
    layout: any[]
  }>()

  const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
    (e: 'update', value: any[]): void
  }>()

  const isOpen = computed({
    get: () => props.open,
    set: (val) => emit('update:open', val)
  })

  const localLayout = ref([...props.layout])

  watch(
    () => props.layout,
    (newLayout) => {
      localLayout.value = [...newLayout]
    },
    { deep: true }
  )

  const sizeOptions = [
    { label: '1 Column', value: 'col-span-1 lg:col-span-1' },
    { label: '2 Columns', value: 'col-span-1 md:col-span-2 lg:col-span-2' },
    { label: 'Full Width', value: 'col-span-1 md:col-span-2 lg:col-span-3' }
  ]

  function getWidgetName(id: string): string {
    const names: Record<string, string> = {
      athleteProfileBasic: 'Athlete Profile',
      trainingLoad: 'Training Load & Form',
      corePerformance: 'Core Performance',
      recentWellness: 'Recent Wellness',
      trainingRecommendation: 'AI Recommendation',
      performanceScores: 'Performance Scores',
      monthlyComparison: 'Monthly Comparison',
      recoveryContext: 'Recovery Context',
      glycogenFuel: 'Glycogen Fuel',
      telemetryRadar: 'Telemetry Radar',
      liveEnergy: 'Live Energy',
      nutritionFueling: 'Fueling & Hydration',
      recentActivity: 'Recent Activity',
      upcomingWorkouts: 'Upcoming Workouts',
      dataSyncStatus: 'Data Sync Status'
    }
    return names[id] || id
  }

  function emitUpdate() {
    emit('update', localLayout.value)
  }
</script>
