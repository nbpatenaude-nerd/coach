<template>
  <UModal v-model:open="isOpen" title="Generate AI Plan">
    <template #body>
      <div class="space-y-4 p-2">
        <p class="text-sm text-gray-500">
          Describe the training plan you want to create. The AI will generate a structured plan
          template with phases, weeks, and volume targets.
        </p>
        <UFormField label="Prompt">
          <UTextarea
            v-model="prompt"
            placeholder="e.g. A 12-week marathon prep plan for an intermediate runner"
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
          @click="generatePlan"
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

  const emit = defineEmits(['update:open', 'generated'])
  const toast = useToast()

  const isOpen = computed({
    get: () => props.open,
    set: (val) => emit('update:open', val)
  })

  const prompt = ref('')
  const generating = ref(false)

  async function generatePlan() {
    if (!prompt.value) return

    generating.value = true
    try {
      const result = await $fetch<any>('/api/library/plans/generate-ai', {
        method: 'POST',
        body: { prompt: prompt.value }
      })

      toast.add({
        title: 'Plan Generated',
        description: 'Your AI training plan has been created.',
        color: 'success'
      })

      isOpen.value = false
      emit('generated', result.plan)
    } catch (e: any) {
      toast.add({
        title: 'Generation Failed',
        description: e.data?.message || 'Could not generate plan.',
        color: 'error'
      })
    } finally {
      generating.value = false
    }
  }
</script>
