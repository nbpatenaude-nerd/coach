<template>
  <form class="space-y-4" @submit.prevent="$emit('submit')">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
      <section
        v-for="section in sections"
        :key="section.key"
        class="rounded-lg border border-gray-200/80 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/30 p-3 sm:p-4 space-y-3"
      >
        <div class="border-b border-gray-200/80 dark:border-gray-800 pb-2">
          <h4
            class="text-xs font-semibold uppercase tracking-wider"
            :style="{ color: accent(section.key) }"
          >
            {{ section.heading }}
          </h4>
          <p
            v-if="section.description"
            class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2"
          >
            {{ section.description }}
          </p>
        </div>

        <div class="space-y-3">
          <div v-for="(field, idx) in section.fields" :key="field.id">
            <template v-if="field.type === 'rating' || field.type === 'number'">
              <div class="flex items-baseline justify-between gap-2 mb-1">
                <span
                  class="text-[11px] font-semibold uppercase tracking-wide truncate"
                  :style="{ color: fieldColor(section.key, idx) }"
                >
                  {{ field.shortTitle }}
                </span>
                <span
                  class="text-sm font-bold tabular-nums shrink-0"
                  :style="{ color: fieldColor(section.key, idx) }"
                >
                  {{ modelValue[field.id] ?? '—' }}
                  <span class="text-[10px] font-normal text-gray-400">/{{ field.max ?? 10 }}</span>
                </span>
              </div>
              <div class="px-0.5">
                <USlider
                  :model-value="Number(modelValue[field.id] ?? field.min ?? 1)"
                  :min="field.min ?? 1"
                  :max="field.max ?? 10"
                  :step="1"
                  color="primary"
                  @update:model-value="setField(field.id, $event)"
                />
              </div>
              <div
                class="flex justify-between text-[10px] uppercase tracking-wide text-gray-400 mt-0.5"
              >
                <span>{{ field.minLabel || 'Low' }}</span>
                <span>{{ field.maxLabel || 'High' }}</span>
              </div>
            </template>

            <UFormField v-else :label="field.label" :name="field.id" size="sm">
              <UTextarea
                :model-value="String(modelValue[field.id] ?? '')"
                :placeholder="field.placeholder"
                :rows="2"
                autoresize
                class="w-full"
                @update:model-value="setField(field.id, $event)"
              />
            </UFormField>
          </div>
        </div>
      </section>
    </div>

    <div class="flex justify-end gap-2 pt-1">
      <UButton
        v-if="showCancel"
        type="button"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="$emit('cancel')"
      >
        Cancel
      </UButton>
      <UButton type="submit" color="primary" size="sm" :loading="submitting" icon="i-lucide-send">
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

  function setField(id: string, value: string | number | number[]) {
    const next = Array.isArray(value) ? (value[0] ?? 0) : value
    emit('update:modelValue', { ...props.modelValue, [id]: next })
  }
</script>
