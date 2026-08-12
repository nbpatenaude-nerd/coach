<template>
  <UCard
    class="mb-8 border-2 border-primary-500/20 bg-primary-50/10 dark:bg-primary-950/10"
    :ui="{ body: 'p-4 sm:p-6' }"
  >
    <div v-if="loading" class="animate-pulse space-y-4">
      <div class="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
      <div class="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
    </div>

    <div v-else-if="currentCheckIn">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-check-circle-solid" class="w-6 h-6 text-green-500" />
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Weekly Check-In Complete</h3>
        </div>
        <p class="text-xs text-neutral-500">
          Submitted {{ formatFullDate(currentCheckIn.submittedAt) }}
        </p>
      </div>
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        You're all set for this week. Your coach will review your responses.
      </p>
    </div>

    <div v-else>
      <div class="flex items-center gap-2 mb-4">
        <UIcon name="i-heroicons-clipboard-document-check" class="w-6 h-6 text-primary-500" />
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Weekly Check-In</h3>
      </div>
      <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
        Please complete your weekly check-in to help your coach tailor your training for next week.
        This resets every Sunday.
      </p>

      <UForm :state="state" class="space-y-4" @submit="submitCheckIn">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormGroup label="Feeling Score (1-10)" help="1 = Exhausted, 10 = Amazing">
            <USelect v-model="state.feelingScore" :options="scoreOptions" />
          </UFormGroup>
          <UFormGroup label="Fatigue Score (1-10)" help="1 = Fresh, 10 = Heavy Fatigue">
            <USelect v-model="state.fatigueScore" :options="scoreOptions" />
          </UFormGroup>
          <UFormGroup label="Stress Level (1-10)" help="1 = Low Stress, 10 = High Stress">
            <USelect v-model="state.stressScore" :options="scoreOptions" />
          </UFormGroup>
          <UFormGroup label="Sleep Quality (1-10)" help="1 = Terrible, 10 = Perfect">
            <USelect v-model="state.sleepQuality" :options="scoreOptions" />
          </UFormGroup>
        </div>

        <UFormGroup label="Additional Notes for Coach">
          <UTextarea
            v-model="state.notes"
            placeholder="Any injuries, schedule changes, or comments?"
            :rows="3"
          />
        </UFormGroup>

        <UButton type="submit" color="primary" label="Submit Check-In" :loading="submitting" />
      </UForm>
    </div>
  </UCard>
</template>

<script setup lang="ts">
  import { format } from 'date-fns'

  const loading = ref(true)
  const submitting = ref(false)
  const currentCheckIn = ref<any>(null)
  const toast = useToast()

  function formatFullDate(d: string | Date) {
    if (!d) return ''
    return format(new Date(d), 'MMM d, yyyy')
  }

  const scoreOptions = [
    { label: 'Select...', value: '' },
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '6', value: 6 },
    { label: '7', value: 7 },
    { label: '8', value: 8 },
    { label: '9', value: 9 },
    { label: '10', value: 10 }
  ]

  const state = reactive({
    feelingScore: '',
    fatigueScore: '',
    stressScore: '',
    sleepQuality: '',
    notes: ''
  })

  async function fetchCheckIn() {
    loading.value = true
    try {
      const res = await $fetch('/api/check-ins/current')
      currentCheckIn.value = res
    } catch (err: any) {
      if (err.statusCode !== 404) {
        console.error(err)
      }
    } finally {
      loading.value = false
    }
  }

  async function submitCheckIn() {
    if (!state.feelingScore || !state.fatigueScore || !state.stressScore || !state.sleepQuality) {
      toast.add({ title: 'Please answer all scores', color: 'error' })
      return
    }

    submitting.value = true
    try {
      const res = await $fetch('/api/check-ins', {
        method: 'POST',
        body: {
          feelingScore: Number(state.feelingScore),
          fatigueScore: Number(state.fatigueScore),
          stressScore: Number(state.stressScore),
          sleepQuality: Number(state.sleepQuality),
          notes: state.notes
        }
      })
      currentCheckIn.value = res
      toast.add({ title: 'Check-In submitted successfully', color: 'success' })
    } catch (err: any) {
      toast.add({ title: 'Failed to submit check-in', color: 'error' })
      console.error(err)
    } finally {
      submitting.value = false
    }
  }

  onMounted(fetchCheckIn)
</script>
