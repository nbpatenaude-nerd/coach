<template>
  <div class="space-y-6">
    <UCard :ui="{ body: 'hidden' }">
      <template #header>
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold uppercase tracking-tight">Custom Trackers</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Define your own metrics to track daily on your wellness check-ins.
            </p>
          </div>
          <UButton
            color="primary"
            icon="i-heroicons-plus"
            @click="
              () => {
                isCreateModalOpen = true
              }
            "
          >
            Create Tracker
          </UButton>
        </div>
      </template>
    </UCard>

    <div v-if="pending" class="space-y-4 mt-6">
      <USkeleton v-for="i in 3" :key="`skeleton-${i}`" class="h-20 w-full" />
    </div>

    <div
      v-else-if="!customFields || customFields.length === 0"
      class="py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl mt-6"
    >
      <UIcon
        name="i-heroicons-chart-bar-square"
        class="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3"
      />
      <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
        You haven't defined any custom trackers yet.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <UCard v-for="field in customFields" :key="field.id">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-bold text-gray-900 dark:text-white">{{ field.label }}</h3>
            <p class="text-sm text-gray-500 mt-1">
              Data Type:
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ field.dataType }}</span>
              <span v-if="field.unit" class="ml-2"
                >Unit:
                <span class="font-medium text-gray-700 dark:text-gray-300">{{
                  field.unit
                }}</span></span
              >
            </p>
          </div>
          <UButton
            color="error"
            variant="ghost"
            icon="i-heroicons-trash"
            size="sm"
            @click="deleteField(field.id)"
          />
        </div>
      </UCard>
    </div>

    <UModal v-model:open="isCreateModalOpen" title="Create Custom Tracker">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Tracker Name" name="label" description="E.g. Sleep Score, Hydration">
            <UInput v-model="form.label" placeholder="My Tracker" class="w-full" />
          </UFormField>

          <UFormField label="Data Type" name="dataType">
            <USelect
              v-model="form.dataType"
              :items="[
                { label: 'Number', value: 'NUMBER' },
                { label: 'Text', value: 'STRING' },
                { label: 'Yes/No', value: 'BOOLEAN' }
              ]"
              class="w-full"
            />
          </UFormField>

          <UFormField v-if="form.dataType === 'NUMBER'" label="Unit (Optional)" name="unit">
            <UInput v-model="form.unit" placeholder="e.g. mg/dL, scale 1-10" class="w-full" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <UButton
            color="neutral"
            variant="ghost"
            @click="
              () => {
                isCreateModalOpen = false
              }
            "
            >Cancel</UButton
          >
          <UButton
            color="primary"
            :loading="isCreating"
            :disabled="!form.label"
            @click="createField"
            >Create</UButton
          >
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'

  definePageMeta({
    middleware: 'auth'
  })

  useHead({
    title: 'Custom Trackers'
  })

  const toast = useToast()

  const { data: customFields, pending, refresh } = useFetch('/api/analytics/fields/definitions')

  const isCreateModalOpen = ref(false)
  const isCreating = ref(false)

  const form = reactive({
    label: '',
    dataType: 'NUMBER',
    unit: '',
    entityType: 'WELLNESS'
  })

  async function createField() {
    try {
      isCreating.value = true

      const fieldKey = form.label.toLowerCase().replace(/[^a-z0-9]/g, '_')

      await $fetch('/api/analytics/fields/definitions', {
        method: 'POST',
        body: {
          ...form,
          fieldKey
        }
      })

      toast.add({ title: 'Tracker created successfully', color: 'success' })
      isCreateModalOpen.value = false
      form.label = ''
      form.unit = ''
      await refresh()
    } catch (e: any) {
      toast.add({
        title: 'Failed to create tracker',
        description: e.message || 'An error occurred',
        color: 'error'
      })
    } finally {
      isCreating.value = false
    }
  }

  async function deleteField(id: string) {
    if (!window.confirm('Are you sure you want to delete this tracker?')) return

    try {
      await $fetch(`/api/analytics/fields/definitions/${id}`, {
        method: 'DELETE'
      })
      toast.add({ title: 'Tracker deleted', color: 'success' })
      await refresh()
    } catch (e: any) {
      toast.add({ title: 'Failed to delete tracker', color: 'error' })
    }
  }
</script>
