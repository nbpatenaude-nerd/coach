<template>
  <ClientOnly>
    <Teleport to="body">
      <div
        v-if="coachingStore.isCoachingMode"
        :class="[
          'fixed top-20 left-1/2 -translate-x-1/2 z-[9999] py-2 px-4 rounded-full shadow-xl',
          'flex items-center gap-4 border whitespace-nowrap text-white',
          coachingStore.isProgramMode
            ? 'bg-violet-600 border-violet-400/40'
            : 'bg-primary-600 border-white/20'
        ]"
      >
        <div class="flex items-center gap-2 text-sm font-medium">
          <UIcon
            :name="coachingStore.isProgramMode ? 'i-heroicons-pencil-square' : 'i-heroicons-eye'"
            class="w-5 h-5"
          />
          <span v-if="coachingStore.isProgramMode">
            Editing: {{ coachingStore.actingAsUserName }} Calendar
          </span>
          <span v-else>
            {{ t('coaching_banner_active', { name: coachingStore.actingAsUserName }) }}
          </span>
        </div>
        <div class="flex items-center gap-4">
          <UButton
            color="neutral"
            variant="solid"
            size="xs"
            :label="t('banner_exit')"
            @click="() => { void coachingStore.stopActingAs() }"
          />
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup>
  import { useTranslate } from '@tolgee/vue'
  const { t } = useTranslate('common')
  const coachingStore = useCoachingStore()
</script>
