<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <div
      class="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between"
    >
      <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="cancel" />
      <h1 class="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
        {{ plannedWorkout?.title || 'Workout' }}
      </h1>
      <UButton color="primary" variant="solid" :loading="submitting" @click="completeWorkout">
        Finish
      </UButton>
    </div>

    <div v-if="loading" class="p-8 text-center">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-primary-500" />
    </div>

    <div v-else-if="!plannedWorkout" class="p-8 text-center text-gray-500">Workout not found.</div>

    <div v-else class="mx-auto max-w-lg p-4 space-y-6">
      <div
        v-for="(block, bIndex) in executionBlocks"
        :key="bIndex"
        class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div class="mb-4">
          <h2 class="text.xs font-black uppercase tracking-widest text-primary-500">
            {{ block.typeLabel }}
          </h2>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">
            {{ block.title || `Block ${bIndex + 1}` }}
          </h3>
          <p v-if="block.notes" class="mt-1 text-sm text-gray-500">{{ block.notes }}</p>
        </div>

        <div class="space-y-6">
          <div v-for="(ex, eIndex) in block.exercises" :key="eIndex" class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="font-bold text-gray-800 dark:text-gray-100">{{ ex.name }}</div>
            </div>
            <p v-if="ex.notes" class="text-xs text-gray-500">{{ ex.notes }}</p>

            <div class="space-y-2">
              <div
                class="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                <div class="col-span-2 text-center">Set</div>
                <div class="col-span-3 text-center">Target</div>
                <div class="col-span-3 text-center">Actual Reps</div>
                <div class="col-span-4 text-center">Actual Weight</div>
              </div>

              <div
                v-for="(setRow, sIndex) in ex.sets"
                :key="sIndex"
                class="grid grid-cols-12 items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-950"
              >
                <div class="col-span-2 text-center font-bold text-gray-600 dark:text-gray-300">
                  {{ setRow.index }}
                </div>
                <div
                  class="col-span-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  <div v-if="setRow.targetValue">{{ setRow.targetValue }}</div>
                  <div v-if="setRow.targetLoad">{{ setRow.targetLoad }}</div>
                </div>
                <div class="col-span-3">
                  <UInput
                    v-model="setRow.actualReps"
                    type="number"
                    placeholder="Reps"
                    size="sm"
                    input-class="text-center"
                  />
                </div>
                <div class="col-span-4">
                  <UInput
                    v-model="setRow.actualWeight"
                    type="number"
                    placeholder="lbs"
                    size="sm"
                    input-class="text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { normalizeStrengthBlocks } from '~/utils/strengthWorkout'

  definePageMeta({
    layout: 'simple'
  })

  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  const workoutId = route.params.id as string
  const loading = ref(true)
  const submitting = ref(false)
  const plannedWorkout = ref<any>(null)
  const executionBlocks = ref<any[]>([])
  const startTime = ref<number>(Date.now())

  async function fetchWorkout() {
    try {
      const data = await $fetch<any>('/api/planned-workouts/' + workoutId)
      plannedWorkout.value = data

      const blocks = normalizeStrengthBlocks(data.structuredWorkout || {})
      executionBlocks.value = blocks.map((block) => {
        return {
          typeLabel:
            block.type === 'warmup'
              ? 'Warm Up'
              : block.type === 'circuit'
                ? 'Circuit'
                : block.type === 'superset'
                  ? 'Superset'
                  : 'Working Sets',
          title: block.title,
          notes: block.notes,
          exercises: block.steps.map((step) => {
            return {
              name: step.name,
              notes: step.notes,
              sets: step.setRows.map((row, index) => ({
                index: index + 1,
                targetValue: row.value,
                targetLoad: row.loadValue,
                actualReps: '',
                actualWeight: ''
              }))
            }
          })
        }
      })
    } catch (error) {
      console.error(error)
      toast.add({ title: 'Error loading workout', color: 'error' })
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchWorkout()
  })

  function cancel() {
    if (confirm('Cancel workout? No data will be saved.')) {
      router.back()
    }
  }

  async function completeWorkout() {
    submitting.value = true
    const durationSec = Math.floor((Date.now() - startTime.value) / 1000)

    const payloadExercises: any[] = []

    executionBlocks.value.forEach((block) => {
      block.exercises.forEach((ex: any) => {
        payloadExercises.push({
          name: ex.name,
          notes: ex.notes,
          sets: ex.sets.map((s: any) => ({
            reps: s.actualReps,
            weight: s.actualWeight,
            weightUnit: 'lb'
          }))
        })
      })
    })

    try {
      await $fetch('/api/workouts/complete-strength', {
        method: 'POST',
        body: {
          plannedWorkoutId: workoutId,
          title: plannedWorkout.value.title,
          durationSec,
          exercises: payloadExercises
        }
      })
      toast.add({ title: 'Workout saved!', color: 'success' })
      router.push('/dashboard')
    } catch (e) {
      console.error(e)
      toast.add({ title: 'Error saving workout', color: 'error' })
    } finally {
      submitting.value = false
    }
  }
</script>
