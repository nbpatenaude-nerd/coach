<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-foreground">Create New Pipeline</h3>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" @click="isOpen = false" />
        </div>
      </template>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">Pipeline Name</label>
          <UInput v-model="form.name" placeholder="e.g. Marketing Campaigns, Sponsorships" />
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-1">Stages (in order)</label>
          <div class="space-y-2">
            <div v-for="(stage, idx) in form.stages" :key="idx" class="flex gap-2">
              <UInput v-model="stage.name" class="flex-1" placeholder="Stage Name" />
              <UButton
                v-if="form.stages.length > 1"
                color="red"
                variant="soft"
                icon="i-lucide-trash-2"
                @click="form.stages.splice(idx, 1)"
              />
            </div>
            <UButton
              color="gray"
              variant="soft"
              size="sm"
              icon="i-lucide-plus"
              @click="form.stages.push({ name: '' })"
            >
              Add Stage
            </UButton>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="gray" variant="soft" @click="isOpen = false">Cancel</UButton>
          <UButton color="primary" :loading="isSaving" @click="savePipeline"
            >Create Pipeline</UButton
          >
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, computed } from 'vue'

  const props = defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits(['update:modelValue', 'created'])

  const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const isSaving = ref(false)
  const form = reactive({
    name: '',
    stages: [{ name: 'Lead' }, { name: 'Review' }, { name: 'Closed' }]
  })

  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        form.name = ''
        form.stages = [{ name: 'Lead' }, { name: 'Review' }, { name: 'Closed' }]
      }
    }
  )

  const savePipeline = async () => {
    if (!form.name || form.stages.some((s) => !s.name.trim())) return

    isSaving.value = true
    try {
      await $fetch('/api/coaching/crm/pipelines', {
        method: 'POST',
        body: { name: form.name, stages: form.stages.map((s) => s.name.trim()).filter(Boolean) }
      })
      emit('created')
      isOpen.value = false
    } catch (e) {
      console.error(e)
    } finally {
      isSaving.value = false
    }
  }
</script>
