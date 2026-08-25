<template>
  <UModal v-model:open="isOpen" title="Apply Workout">
    <template #body>
      <div class="space-y-4 p-2">
        <div>
          <label class="block text-sm font-medium mb-1">Workout</label>
          <div class="text-gray-900 dark:text-white font-bold">{{ template?.title }}</div>
        </div>

        <UFormField label="Select Athletes" name="athletes">
          <USelectMenu
            v-model="selectedAthletes"
            :options="athletes"
            option-attribute="name"
            value-attribute="id"
            multiple
            placeholder="Select athletes..."
            :loading="loadingAthletes"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Date" name="date">
          <UInput v-model="selectedDate" type="date" class="w-full" />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="isOpen = false">Cancel</UButton>
        <UButton
          color="primary"
          :loading="applying"
          :disabled="!selectedDate || selectedAthletes.length === 0"
          @click="applyWorkout"
        >
          Apply
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'

  const props = defineProps<{
    open: boolean
    template: any
  }>()

  const emit = defineEmits(['update:open', 'applied'])
  const toast = useToast()

  const isOpen = computed({
    get: () => props.open,
    set: (val) => emit('update:open', val)
  })

  const selectedAthletes = ref<string[]>([])
  const selectedDate = ref('')
  const applying = ref(false)

  const { data: athletesData, pending: loadingAthletes } = useFetch<any>('/api/coaching/athletes', {
    immediate: true
  })

  const athletes = computed(() => {
    return athletesData.value || []
  })

  watch(
    () => props.open,
    (open) => {
      if (open) {
        selectedAthletes.value = []
        selectedDate.value = new Date().toISOString().split('T')[0]
      }
    }
  )

  async function applyWorkout() {
    if (!selectedDate.value || selectedAthletes.value.length === 0) return

    applying.value = true
    try {
      await $fetch('/api/coaching/workouts/apply', {
        method: 'POST',
        body: {
          template: props.template,
          athleteIds: selectedAthletes.value,
          date: selectedDate.value
        }
      })

      toast.add({
        title: 'Workout Applied',
        description: `Successfully applied to ${selectedAthletes.value.length} athlete(s).`,
        color: 'success'
      })
      isOpen.value = false
      emit('applied')
    } catch (e: any) {
      toast.add({
        title: 'Apply Failed',
        description: e.data?.message || 'Could not apply workout.',
        color: 'error'
      })
    } finally {
      applying.value = false
    }
  }
</script>
