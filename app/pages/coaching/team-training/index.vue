<script setup lang="ts">
  definePageMeta({
    middleware: ['auth', 'coach'] as any
  })

  const { data: programs, refresh } = await useFetch('/api/coaching/programs')

  const isCreateModalOpen = ref(false)
  const newProgramName = ref('')
  const newProgramDescription = ref('')
  const isCreating = ref(false)
  const toast = useToast()

  async function createProgram() {
    if (!newProgramName.value || isCreating.value) return
    isCreating.value = true
    try {
      const result = await $fetch<{ success: boolean; programId: string }>(
        '/api/coaching/programs',
        {
          method: 'POST',
          body: { name: newProgramName.value, description: newProgramDescription.value }
        }
      )
      isCreateModalOpen.value = false
      newProgramName.value = ''
      newProgramDescription.value = ''
      await refresh()
      await navigateTo(`/coaching/team-training/${result.programId}`)
    } catch (err: any) {
      toast.add({
        title: 'Failed to create program',
        description: err?.data?.message || 'An error occurred. Please try again.',
        color: 'red'
      })
    } finally {
      isCreating.value = false
    }
  }

  function getSubscribeLink(program: any) {
    const base = import.meta.client ? window.location.origin : ''
    return `${base}/programs/${program.id}/subscribe`
  }

  function copyLink(program: any) {
    navigator.clipboard.writeText(getSubscribeLink(program))
    toast.add({
      title: 'Link Copied',
      description: 'Share this link with athletes to let them subscribe.'
    })
  }
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Group Training Programs</h1>
        <p class="text-muted mt-1 text-sm">
          Create date-anchored programs that live-sync workouts to subscribed athletes.
        </p>
      </div>
      <UButton
        color="primary"
        icon="i-lucide-plus"
        @click="isCreateModalOpen = true"
      >
        Create Program
      </UButton>
    </div>

    <div v-if="programs?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="program in programs"
        :key="program.id"
        class="bg-card border border-border rounded-xl p-6 flex flex-col hover:border-primary/50 transition-colors"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold">{{ program.name }}</h3>
            <p class="text-sm text-muted">
              {{ program.subscriberCount }}
              {{ program.subscriberCount === 1 ? 'Athlete' : 'Athletes' }} Subscribed
            </p>
          </div>
          <UAvatar :src="program.image ?? undefined" :alt="program.name" size="md" />
        </div>

        <div class="mt-auto pt-4 border-t border-border flex flex-col gap-2">
          <UButton
            block
            color="neutral"
            variant="solid"
            icon="i-lucide-settings"
            :to="`/coaching/team-training/${program.id}`"
          >
            Manage Program
          </UButton>
          <UButton
            block
            color="neutral"
            variant="ghost"
            icon="i-lucide-link"
            @click="copyLink(program)"
          >
            Copy Subscribe Link
          </UButton>
        </div>
      </div>
    </div>

    <div
      v-else
      class="bg-card border border-border rounded-xl p-12 text-center"
    >
      <UIcon name="i-lucide-users" class="w-12 h-12 mx-auto mb-4 opacity-40" />
      <h3 class="text-lg font-medium mb-2">No Group Programs Yet</h3>
      <p class="text-muted text-sm max-w-md mx-auto mb-6">
        Create a program to build a date-anchored training calendar. Athletes subscribe and
        workouts automatically appear on their calendar.
      </p>
      <UButton color="primary" @click="isCreateModalOpen = true">
        Create First Program
      </UButton>
    </div>

    <UModal v-model:open="isCreateModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-bold">Create Group Program</h3>
          </template>
          <div class="space-y-4">
            <UFormField label="Program Name" required>
              <UInput
                v-model="newProgramName"
                placeholder="e.g. UVic Tri Club — Fall 2025"
                autofocus
              />
            </UFormField>
            <UFormField label="Description">
              <UTextarea
                v-model="newProgramDescription"
                placeholder="Optional details about this program..."
              />
            </UFormField>
          </div>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                :disabled="isCreating"
                @click="isCreateModalOpen = false"
              >
                Cancel
              </UButton>
              <UButton
                color="primary"
                :loading="isCreating"
                :disabled="!newProgramName"
                @click="createProgram"
              >
                Create
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
