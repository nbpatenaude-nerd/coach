<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-white">Complete Goal</h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="isOpen = false"
          />
        </div>
      </template>

      <form class="space-y-4" @submit.prevent="submitCompletion">
        <UFormGroup label="Completion Level">
          <USelect
            v-model="form.completionLevel"
            :options="[
              { label: 'Fully Completed', value: 'FULL' },
              { label: 'Partially Completed', value: 'PARTIAL' }
            ]"
          />
        </UFormGroup>

        <UFormGroup label="To what extent? (Notes)" hint="Optional">
          <UTextarea
            v-model="form.completionNotes"
            placeholder="e.g. Achieved 80% of my target wattage..."
            :rows="3"
          />
        </UFormGroup>

        <div class="flex justify-end gap-3 mt-6">
          <UButton color="white" variant="ghost" @click="isOpen = false">Cancel</UButton>
          <UButton type="submit" color="success" :loading="loading">Mark Complete</UButton>
        </div>
      </form>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  const props = defineProps<{ modelValue: boolean; goal: any }>()
  const emit = defineEmits(['update:modelValue', 'completed'])
  const toast = useToast()

  const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const form = ref({
    completionLevel: 'FULL',
    completionNotes: ''
  })

  const loading = ref(false)

  const submitCompletion = async () => {
    if (!props.goal?.id) return
    loading.value = true
    try {
      await $fetch(`/api/goals/${props.goal.id}/complete`, {
        method: 'POST',
        body: { ...form.value }
      })
      toast.add({ title: 'Goal marked as complete!', color: 'success' })
      isOpen.value = false
      emit('completed')
    } catch (e: any) {
      toast.add({ title: 'Failed to complete goal', description: e.message, color: 'error' })
    } finally {
      loading.value = false
    }
  }
</script>
