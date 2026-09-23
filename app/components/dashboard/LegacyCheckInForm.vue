<script setup lang="ts">
  import { reactive, ref, onMounted } from 'vue'
  import { z } from 'zod'

  const emit = defineEmits(['success'])
  const toast = useToast()

  const state = reactive({
    // Subjective Metrics (1-10)
    personalFatigue: 5,
    wellnessSleep: 5,
    wellnessStress: 5,
    trainingLoad: 5,
    trainingDifficulty: 5,
    trainingHydration: 5,
    trainingNutrition: 5,
    trainingRecovery: 5,

    // Text Responses
    personalChallenges: '',
    personalGoals: '',
    personalHighlights: '',
    personalNotes: '',
    wellnessInjury: '',
    wellnessPain: ''
  })

  // Validation Schema
  const schema = z.object({
    personalFatigue: z.number().min(1).max(10),
    wellnessSleep: z.number().min(1).max(10),
    wellnessStress: z.number().min(1).max(10),
    trainingLoad: z.number().min(1).max(10),
    trainingDifficulty: z.number().min(1).max(10),
    trainingHydration: z.number().min(1).max(10),
    trainingNutrition: z.number().min(1).max(10),
    trainingRecovery: z.number().min(1).max(10),

    personalChallenges: z.string().optional(),
    personalGoals: z.string().optional(),
    personalHighlights: z.string().optional(),
    personalNotes: z.string().optional(),
    wellnessInjury: z.string().optional(),
    wellnessPain: z.string().optional()
  })

  const isLoading = ref(true)
  const isSubmitting = ref(false)
  const isCompleted = ref(false)
  const currentCheckIn = ref<any>(null)

  async function fetchCheckIn() {
    isLoading.value = true
    try {
      const res = await $fetch('/api/check-ins/current')
      if (res) {
        currentCheckIn.value = res
        isCompleted.value = true
      }
    } catch (err: any) {
      if (err.statusCode !== 404) {
        console.error(err)
      }
    } finally {
      isLoading.value = false
    }
  }

  async function onSubmit() {
    isSubmitting.value = true
    try {
      await $fetch('/api/check-ins', {
        method: 'POST',
        body: state
      })

      toast.add({
        title: 'Check-In Submitted!',
        description: 'Journey Endurance is analyzing your data...',
        icon: 'i-lucide-check-circle',
        color: 'success'
      })

      isCompleted.value = true
      emit('success')
    } catch (error) {
      toast.add({
        title: 'Error Submitting Check-In',
        description: 'Please try again later.',
        icon: 'i-lucide-alert-circle',
        color: 'error'
      })
    } finally {
      isSubmitting.value = false
    }
  }

  onMounted(fetchCheckIn)

  // Helper to render the scale
  const scaleHelp = '1 = Low / 10 = High'
  const scaleHelpGood = '1 = Poor / 10 = Excellent'
</script>

<template>
  <UCard class="mb-6 h-full flex flex-col py-8">
    <div v-if="isLoading" class="animate-pulse space-y-4 text-center mx-auto">
      <div class="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-2"></div>
      <div class="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
    </div>

    <div v-else-if="isCompleted" class="text-center">
      <div class="flex items-center justify-center gap-2 mb-4">
        <UIcon name="i-lucide-check-circle" class="w-8 h-8 text-green-500" />
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Weekly Check-In Complete</h3>
      </div>
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        You're all set for this week. Your coach will review your responses.
      </p>
    </div>

    <div v-else>
      <div class="text-center mb-8">
        <UIcon name="i-lucide-clipboard-check" class="w-12 h-12 text-primary-500 mb-4 mx-auto" />
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Ready for your weekly review?
        </h2>
        <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm">
          Track your progress, log your wellness metrics, and give your coach the context they need.
        </p>
      </div>

      <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 1-10 Metrics -->
          <UFormField label="Personal Fatigue" name="personalFatigue" :description="scaleHelp">
            <div class="flex items-center gap-4 mt-2">
              <span class="text-xs text-gray-500 font-bold">1</span>
              <URange v-model="state.personalFatigue" :min="1" :max="10" class="flex-1" />
              <span class="text-xs text-gray-500 font-bold">10</span>
            </div>
            <div class="text-center font-semibold mt-1">{{ state.personalFatigue }}</div>
          </UFormField>

          <UFormField label="Sleep Quality" name="wellnessSleep" :description="scaleHelpGood">
            <div class="flex items-center gap-4 mt-2">
              <span class="text-xs text-gray-500 font-bold">1</span>
              <URange v-model="state.wellnessSleep" :min="1" :max="10" class="flex-1" />
              <span class="text-xs text-gray-500 font-bold">10</span>
            </div>
            <div class="text-center font-semibold mt-1">{{ state.wellnessSleep }}</div>
          </UFormField>

          <UFormField label="Stress Levels" name="wellnessStress" :description="scaleHelp">
            <div class="flex items-center gap-4 mt-2">
              <span class="text-xs text-gray-500 font-bold">1</span>
              <URange v-model="state.wellnessStress" :min="1" :max="10" class="flex-1" />
              <span class="text-xs text-gray-500 font-bold">10</span>
            </div>
            <div class="text-center font-semibold mt-1">{{ state.wellnessStress }}</div>
          </UFormField>

          <UFormField label="Training Load" name="trainingLoad" :description="scaleHelp">
            <div class="flex items-center gap-4 mt-2">
              <span class="text-xs text-gray-500 font-bold">1</span>
              <URange v-model="state.trainingLoad" :min="1" :max="10" class="flex-1" />
              <span class="text-xs text-gray-500 font-bold">10</span>
            </div>
            <div class="text-center font-semibold mt-1">{{ state.trainingLoad }}</div>
          </UFormField>

          <UFormField
            label="Training Difficulty"
            name="trainingDifficulty"
            :description="scaleHelp"
          >
            <div class="flex items-center gap-4 mt-2">
              <span class="text-xs text-gray-500 font-bold">1</span>
              <URange v-model="state.trainingDifficulty" :min="1" :max="10" class="flex-1" />
              <span class="text-xs text-gray-500 font-bold">10</span>
            </div>
            <div class="text-center font-semibold mt-1">{{ state.trainingDifficulty }}</div>
          </UFormField>

          <UFormField label="Hydration" name="trainingHydration" :description="scaleHelpGood">
            <div class="flex items-center gap-4 mt-2">
              <span class="text-xs text-gray-500 font-bold">1</span>
              <URange v-model="state.trainingHydration" :min="1" :max="10" class="flex-1" />
              <span class="text-xs text-gray-500 font-bold">10</span>
            </div>
            <div class="text-center font-semibold mt-1">{{ state.trainingHydration }}</div>
          </UFormField>

          <UFormField label="Nutrition" name="trainingNutrition" :description="scaleHelpGood">
            <div class="flex items-center gap-4 mt-2">
              <span class="text-xs text-gray-500 font-bold">1</span>
              <URange v-model="state.trainingNutrition" :min="1" :max="10" class="flex-1" />
              <span class="text-xs text-gray-500 font-bold">10</span>
            </div>
            <div class="text-center font-semibold mt-1">{{ state.trainingNutrition }}</div>
          </UFormField>

          <UFormField label="Recovery" name="trainingRecovery" :description="scaleHelpGood">
            <div class="flex items-center gap-4 mt-2">
              <span class="text-xs text-gray-500 font-bold">1</span>
              <URange v-model="state.trainingRecovery" :min="1" :max="10" class="flex-1" />
              <span class="text-xs text-gray-500 font-bold">10</span>
            </div>
            <div class="text-center font-semibold mt-1">{{ state.trainingRecovery }}</div>
          </UFormField>
        </div>

        <USeparator class="my-6" />

        <div class="space-y-4">
          <h3 class="text-lg font-semibold mb-4">Additional Context (Optional)</h3>

          <UFormField label="Personal Notes" name="personalNotes">
            <UTextarea
              v-model="state.personalNotes"
              placeholder="Any general thoughts or feelings on your training..."
            />
          </UFormField>

          <UFormField label="Current Challenges" name="personalChallenges">
            <UTextarea
              v-model="state.personalChallenges"
              placeholder="What's holding you back right now?"
            />
          </UFormField>

          <UFormField label="Upcoming Goals" name="personalGoals">
            <UTextarea v-model="state.personalGoals" placeholder="What are we pushing for?" />
          </UFormField>

          <UFormField label="Weekly Highlights" name="personalHighlights">
            <UTextarea v-model="state.personalHighlights" placeholder="What went well?" />
          </UFormField>

          <UFormField label="Reported Injuries" name="wellnessInjury">
            <UTextarea
              v-model="state.wellnessInjury"
              placeholder="Describe any specific injuries..."
            />
          </UFormField>

          <UFormField label="Reported Pain / Soreness" name="wellnessPain">
            <UTextarea
              v-model="state.wellnessPain"
              placeholder="Describe any pain or general soreness..."
            />
          </UFormField>
        </div>

        <div class="flex justify-end pt-4">
          <UButton
            type="submit"
            color="primary"
            size="lg"
            :loading="isSubmitting"
            icon="i-lucide-send"
          >
            Submit Check-In
          </UButton>
        </div>
      </UForm>
    </div>
  </UCard>
</template>
