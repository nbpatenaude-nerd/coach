<template>
  <form class="space-y-8" @submit.prevent="$emit('submit')">
    <div v-for="section in sections" :key="section.key" class="space-y-5">
      <div>
        <h4 class="text-lg font-bold tracking-tight" :style="{ color: accent(section.key) }">
          {{ section.heading }}
        </h4>
        <p v-if="section.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ section.description }}
        </p>
      </div>

      <div class="space-y-6">
        <div v-for="(field, idx) in section.fields" :key="field.id">
          <template v-if="field.type === 'rating' || field.type === 'number'">
            <div class="flex justify-center items-center gap-2 mb-1">
              <span
                class="text-xs font-bold tracking-widest uppercase"
                :style="{ color: fieldColor(section.key, idx) }"
              >
                {{ field.shortTitle }}
              </span>
            </div>
            <p class="text-xs text-center text-gray-500 dark:text-gray-400 mb-2">
              {{ field.label }}
            </p>
            <div class="flex justify-between text-[11px] uppercase text-gray-400 mb-1 px-1">
              <span>{{ field.minLabel || 'Low' }}</span>
              <span
                class="font-bold text-sm normal-case"
                :style="{ color: fieldColor(section.key, idx) }"
              >
                [ {{ modelValue[field.id] ?? '—' }} / {{ field.max ?? 10 }} ]
              </span>
              <span>{{ field.maxLabel || 'High' }}</span>
            </div>
            <URange
              :model-value="Number(modelValue[field.id] ?? field.min ?? 1)"
              :min="field.min ?? 1"
              :max="field.max ?? 10"
              :step="1"
              class="w-full"
              @update:model-value="setField(field.id, $event)"
            />
          </template>

          <UFormField v-else :label="field.label" :name="field.id">
            <UTextarea
              :model-value="String(modelValue[field.id] ?? '')"
              :placeholder="field.placeholder"
              :rows="3"
              class="w-full"
              @update:model-value="setField(field.id, $event)"
            />
          </UFormField>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <UButton
        v-if="showCancel"
        type="button"
        color="neutral"
        variant="ghost"
        @click="$emit('cancel')"
      >
        Cancel
      </UButton>
      <UButton type="submit" color="primary" size="lg" :loading="submitting" icon="i-lucide-send">
        {{ submitLabel }}
      </UButton>
    </div>
  </form>
</template>

<script setup lang="ts">
  import type { CheckInFormDefinition, CheckInSectionKey } from '~~/shared/check-in'
  import { CHECK_IN_SECTION_COLORS } from '~~/shared/check-in'

  const props = withDefaults(
    defineProps<{
      sections: CheckInFormDefinition['sections']
      modelValue: Record<string, string | number>
      submitting?: boolean
      submitLabel?: string
      showCancel?: boolean
    }>(),
    {
      submitting: false,
      submitLabel: 'Submit Check-In',
      showCancel: false
    }
  )

  const emit = defineEmits<{
    'update:modelValue': [value: Record<string, string | number>]
    submit: []
    cancel: []
  }>()

  function accent(key: CheckInSectionKey) {
    return CHECK_IN_SECTION_COLORS[key]?.[0] ?? '#00A8FF'
  }

  function fieldColor(key: CheckInSectionKey, index: number) {
    const palette = CHECK_IN_SECTION_COLORS[key] ?? CHECK_IN_SECTION_COLORS.training
    return palette[index % palette.length]!
  }

  function setField(id: string, value: string | number) {
    emit('update:modelValue', { ...props.modelValue, [id]: value })
  }
</script>
