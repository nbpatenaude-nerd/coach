<template>
  <UModal v-model:open="isOpen" title="Generate AI Workout">
    <template #body>
      <div class="space-y-4 p-2">
        <p class="text-sm text-gray-500">
          Describe the workout you want to create. The AI will generate a structured workout
          template with steps, duration, and intensity targets.
        </p>
        <UFormField label="Prompt">
          <UTextarea
            v-model="prompt"
            placeholder="e.g. A 45-minute recovery spin with 3x3 min threshold intervals"
            :rows="4"
            class="w-full"
            autofocus
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="isOpen = false">Cancel</UButton>
        <UButton
          color="primary"
          :loading="generating"
          :disabled="!prompt || prompt.length < 5"
          @click="generateWorkout"
        >
          Generate
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  const props = defineProps<{
    open: boolean
  }>()

  const emit = defineEmits(['update:open', 'created'])
  const toast = useToast()

  const isOpen = computed({
    get: () => props.open,
    set: (val) => emit('update:open', val)
  })

  const prompt = ref('')
  const generating = ref(false)

  async function generateWorkout() {
    if (!prompt.value) return
    generating.value = true
    try {
      const response = await $fetch('/api/library/workouts/generate-ai', {
        method: 'POST',
        body: { prompt: prompt.value }
      })
      if (response && response.template) {
        toast.add({
          title: 'Workout generated',
          color: 'success'
        })
        emit('created', response.template)
        isOpen.value = false
        prompt.value = ''
      }
    } catch (e: any) {
      toast.add({
        title: 'Generation failed',
        description: e.data?.message || 'Could not generate workout',
        color: 'error'
      })
    } finally {
      generating.value = false
    }
  }
</script>
