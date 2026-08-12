<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-primary" />
        <h2 class="text-xl font-semibold">{{ t('ai_coach_header') }}</h2>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Coach Personality -->
      <div>
        <label class="block text-sm font-medium mb-2">{{ t('coach_section_personality') }}</label>
        <p class="text-sm text-muted mb-3">
          {{ t('coach_section_personality_desc') }}
        </p>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <USelect
            v-model="localSettings.aiPersona"
            :items="personaOptions"
            size="lg"
            class="min-w-0 flex-1"
            @update:model-value="handleChange"
          />
          <UButton
            color="neutral"
            variant="soft"
            icon="i-heroicons-speaker-wave"
            :label="t('coach_voice_button')"
            @click="
              () => {
                isVoiceSettingsOpen = true
              }
            "
          />
        </div>
      </div>

      <!-- Coach Autonomy Limit -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium">Coach Autonomy Limit</label>
          <span class="text-sm font-bold text-primary"
            >{{ localSettings.aiWorkoutAutonomyLimit }}%</span
          >
        </div>
        <p class="text-sm text-muted mb-4">
          Determine how much the AI can alter an athlete's workouts (between 10% and 50%) without
          requiring explicit Coach approval.
        </p>
        <div class="px-2">
          <URange
            v-model="localSettings.aiWorkoutAutonomyLimit"
            :min="10"
            :max="50"
            :step="5"
            size="md"
            @change="handleChange"
          />
        </div>
        <div class="flex justify-between text-xs text-muted mt-2 px-2">
          <span>10% (Strict)</span>
          <span>50% (Flexible)</span>
        </div>
      </div>

      <!-- Communication Preferences -->
      <div>
        <label class="block text-sm font-medium mb-2">{{ t('coach_communication') }}</label>
        <p class="text-sm text-muted mb-3">{{ t('coach_communication_desc') }}</p>
        <div class="space-y-3">
          <USwitch
            v-model="localSettings.aiConversationalEngagement"
            :label="t('coach_conversational_label')"
            :description="t('coach_conversational_desc')"
            @update:model-value="handleChange"
          />
        </div>
      </div>

      <!-- Data & Privacy Settings -->
      <div>
        <label class="block text-sm font-medium mb-2">{{ t('coach_data_privacy') }}</label>
        <p class="text-sm text-muted mb-3">{{ t('coach_data_privacy_desc') }}</p>
        <div class="space-y-3">
          <USwitch
            v-model="localSettings.nutritionTrackingEnabled"
            :label="t('coach_nutrition_analysis_label')"
            :description="t('coach_nutrition_analysis_desc')"
            @update:model-value="handleChange"
          />
          <USwitch
            v-model="localSettings.updateWorkoutNotesEnabled"
            :label="t('coach_update_notes_label')"
            :description="t('coach_update_notes_desc')"
            @update:model-value="handleChange"
          />
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <UButton
          :loading="saving"
          @click="
            () => {
              void saveSettings()
            }
          "
        >
          {{ t('settings_save_changes') }}
        </UButton>
      </div>
    </div>
  </UCard>

  <SettingsAiVoiceSettingsModal
    v-model:open="isVoiceSettingsOpen"
    v-model:gemini-voice-name="localSettings.aiTtsVoiceName"
    v-model:voice-style="localSettings.aiTtsStyle"
    v-model:voice-speed="localSettings.aiTtsSpeed"
    v-model:auto-read-messages="localSettings.aiTtsAutoReadMessages"
  />
</template>

<script setup lang="ts">
  import { useTranslate } from '@tolgee/vue'

  const { t } = useTranslate('settings')

  const props = defineProps<{
    forceUnlocked?: boolean
    settings: {
      aiPersona: string
      aiModelPreference: string
      aiAutoAnalyzeWorkouts: boolean
      aiAutoAnalyzeNutrition: boolean
      aiAutoAnalyzeReadiness: boolean
      aiRequireToolApproval: boolean
      aiProactivityEnabled: boolean
      aiConversationalEngagement: boolean
      aiMemoryEnabled: boolean
      aiDeepAnalysisEnabled: boolean
      aiContext: string | null
      nutritionTrackingEnabled: boolean
      updateWorkoutNotesEnabled: boolean
      nickname: string | null
      aiTtsStyle: string
      aiTtsVoiceName: string
      aiTtsSpeed: string
      aiTtsAutoReadMessages: boolean
      aiWorkoutAutonomyLimit: number
    }
  }>()

  const emit = defineEmits<{
    (e: 'save', settings: any): void
  }>()

  const localSettings = ref({ ...props.settings })
  const saving = ref(false)
  const isVoiceSettingsOpen = ref(false)

  const personaOptions = [
    { value: 'Analytical', label: t.value('coach_persona_analytical') },
    { value: 'Supportive', label: t.value('coach_persona_supportive') },
    { value: 'Drill Sergeant', label: t.value('coach_persona_drill') },
    { value: 'Motivational', label: t.value('coach_persona_motivational') }
  ]

  function handleChange() {
    // Auto-save on change (optional, can be removed if you want explicit save only)
    // For now, just mark as changed
  }

  async function saveSettings() {
    saving.value = true
    try {
      emit('save', { ...localSettings.value })
    } finally {
      saving.value = false
    }
  }

  // Watch for prop changes to update local state
  watch(
    () => props.settings,
    (newSettings) => {
      localSettings.value = { ...newSettings }
    },
    { deep: true }
  )
</script>
