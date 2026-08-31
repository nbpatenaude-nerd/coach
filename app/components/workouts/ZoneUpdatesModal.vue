<template>
  <UModal v-model="isOpen" :prevent-close="isSaving">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-sparkles" class="text-primary w-5 h-5" />
            Level Up Detected
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            class="-my-1"
            :disabled="isSaving"
            @click="isOpen = false"
          />
        </div>
      </template>

      <div class="space-y-6">
        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          Based on your latest workout, the AI detected a definitive shift in your fitness and
          recommends updating your training metrics.
        </p>

        <div class="space-y-3">
          <div
            v-for="(update, index) in zoneUpdates"
            :key="index"
            class="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-200 dark:border-white/10 relative overflow-hidden"
          >
            <div class="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div class="flex justify-between items-center mb-2 pl-2">
              <span class="font-bold text-gray-900 dark:text-white tracking-wide text-sm">{{
                formatMetric(update.metric)
              }}</span>
              <span class="font-black text-xl text-primary">{{ update.newValue }}</span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 italic pl-2">
              "{{ update.reason }}"
            </p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="gray" variant="ghost" :loading="isSaving" @click="handleReject"
            >Dismiss</UButton
          >
          <UButton color="primary" variant="solid" :loading="isSaving" @click="handleAccept"
            >Accept Updates</UButton
          >
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { useUserStore } from '~/stores/user'
  import { useToast } from '#imports'

  const props = defineProps<{
    modelValue: boolean
    zoneUpdates: Array<{ metric: string; newValue: number; reason: string }>
    workoutType?: string | null
    action?: 'accept' | 'reject'
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    resolved: []
  }>()

  const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const isSaving = ref(false)
  const userStore = useUserStore()
  const toast = useToast()

  function formatMetric(metric: string) {
    const map: Record<string, string> = {
      FTP: 'Cycling FTP (Watts)',
      LTHR: 'Lactate Threshold HR (bpm)',
      MAX_HR: 'Maximum Heart Rate (bpm)',
      THRESHOLD_PACE: 'Threshold Pace'
    }
    return map[metric] || metric
  }

  // Convert metric names to our sportSettings schema keys
  function getSettingKey(metric: string): string | null {
    switch (metric) {
      case 'FTP':
        return 'ftp'
      case 'LTHR':
        return 'lthr'
      case 'MAX_HR':
        return 'maxHr'
      case 'THRESHOLD_PACE':
        return 'thresholdPace'
      default:
        return null
    }
  }

  async function handleAccept() {
    if (!props.zoneUpdates?.length) {
      isOpen.value = false
      return
    }

    isSaving.value = true
    try {
      // 1. Find or create the matching sport setting for this workout's sport
      const existingSettings = userStore.user?.sportSettings || []
      const targetSetting = existingSettings.find(
        (s: any) => props.workoutType && s.types.includes(props.workoutType)
      )

      // Fallback: If not found, use default or create new payload for this sport
      let patchPayload: any = {}
      if (targetSetting) {
        patchPayload = { ...targetSetting }
      } else {
        patchPayload = {
          types: props.workoutType ? [props.workoutType] : ['Run', 'Ride', 'Swim', 'Other'],
          isDefault: existingSettings.length === 0
        }
      }

      // 2. Apply updates
      let appliedCount = 0
      for (const update of props.zoneUpdates) {
        const key = getSettingKey(update.metric)
        if (key) {
          patchPayload[key] = update.newValue
          appliedCount++
        }
      }

      if (appliedCount > 0) {
        // 3. Save via the profile endpoint
        await $fetch('/api/profile', {
          method: 'PATCH',
          body: {
            sportSettings: [patchPayload]
          }
        })

        await userStore.fetchUser() // Refresh local store

        toast.add({
          title: 'Zones Updated',
          description: `Successfully applied ${appliedCount} AI recommendation(s).`,
          color: 'green',
          icon: 'i-heroicons-check-circle'
        })
      }

      emit('resolved')
      isOpen.value = false
    } catch (error: any) {
      console.error('Failed to accept zone updates:', error)
      toast.add({
        title: 'Update Failed',
        description: error.message || 'Could not save your new zones.',
        color: 'red',
        icon: 'i-heroicons-exclamation-circle'
      })
    } finally {
      isSaving.value = false
    }
  }

  function handleReject() {
    isOpen.value = false
    emit('resolved')
  }

  onMounted(() => {
    if (props.modelValue && props.action === 'accept') {
      handleAccept()
    } else if (props.modelValue && props.action === 'reject') {
      handleReject()
    }
  })
</script>
