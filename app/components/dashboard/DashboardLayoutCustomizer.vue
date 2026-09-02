<template>
  <USlideover v-model:open="isOpen" title="Customize Layout" side="right">
    <template #content>
      <UCard class="flex flex-col flex-1 h-full border-0 rounded-none">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-bold text-lg">Customize Layout</h2>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark"
              class="-my-1"
              @click="isOpen = false"
            />
          </div>
        </template>

        <div class="p-4 flex-grow overflow-y-auto">
          <div
            v-for="(element, index) in localLayout"
            :key="element.id"
            class="flex items-center gap-2 mb-3 p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 shadow-sm"
          >
            <USelect
              :model-value="index"
              :options="positionOptions"
              option-attribute="label"
              value-attribute="value"
              size="xs"
              class="w-16"
              @update:model-value="changePosition(index, $event)"
            />
            <div class="flex-grow ml-1">
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
        </div>
      </UCard>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'

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

  // Only reset local layout when the slideover is opened
  // Doing this constantly breaks vuedraggable's internal DOM tracking
  watch(
    () => props.open,
    (isOpen) => {
      if (isOpen) {
        localLayout.value = [...props.layout]
      }
    }
  )

  const positionOptions = computed(() => {
    return localLayout.value.map((_, i) => ({ label: String(i + 1), value: i }))
  })

  function changePosition(oldIndex: number, newIndex: number) {
    if (oldIndex === newIndex) return
    const item = localLayout.value.splice(oldIndex, 1)[0]
    localLayout.value.splice(newIndex, 0, item)
    emitUpdate()
  }

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
