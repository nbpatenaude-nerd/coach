<script setup lang="ts">
  import { ref } from 'vue'
  import { useAuth } from '../../../composables/useAuth'

  const { data: programs, refresh } = await useFetch('/api/coaching/programs')
  const { startActingAs } = useAuth()

  const isCreateModalOpen = ref(false)
  const newProgramName = ref('')
  const newProgramDescription = ref('')

  async function createProgram() {
    if (!newProgramName.value) return
    await $fetch('/api/coaching/programs', {
      method: 'POST',
      body: { name: newProgramName.value, description: newProgramDescription.value }
    })
    isCreateModalOpen.value = false
    newProgramName.value = ''
    newProgramDescription.value = ''
    await refresh()
  }

  function manageProgram(program: any) {
    startActingAs({ id: program.id, name: program.name })
    navigateTo('/calendar')
  }

  function getSubscribeLink(program: any) {
    // We can just generate a link that athletes can click to subscribe
    return `${window.location.origin}/programs/${program.id}/subscribe`
  }

  function copyLink(program: any) {
    navigator.clipboard.writeText(getSubscribeLink(program))
    useToast().add({
      title: 'Link Copied',
      description: 'Share this link with athletes to let them subscribe.'
    })
  }
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Group Training Programs</h2>
      <UButton color="primary" icon="i-lucide-plus" @click="isCreateModalOpen = true"
        >Create Program</UButton
      >
    </div>

    <div v-if="programs?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="program in programs"
        :key="program.id"
        class="bg-card border border-border rounded-xl p-6 flex flex-col hover:border-primary/50 transition-colors"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-foreground">{{ program.name }}</h3>
            <p class="text-sm text-muted-foreground">
              {{ program.subscriberCount }} Subscribed Athletes
            </p>
          </div>
          <UAvatar :src="program.image" :alt="program.name" size="md" />
        </div>

        <div class="mt-auto pt-4 border-t border-border flex flex-col gap-2">
          <UButton
            block
            color="gray"
            variant="solid"
            icon="i-lucide-calendar"
            @click="manageProgram(program)"
          >
            Manage Calendar & Plan
          </UButton>
          <UButton
            block
            color="gray"
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
      class="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground"
    >
      <Icon name="lucide:users" class="w-12 h-12 mx-auto mb-4 opacity-50" />
      <h3 class="text-lg font-medium text-foreground mb-2">No Group Programs</h3>
      <p class="max-w-md mx-auto mb-6">
        Create a virtual program account. You can build out its calendar and athletes can subscribe
        to have the workouts automatically synced to their personal calendars.
      </p>
      <UButton color="primary" @click="isCreateModalOpen = true">Create First Program</UButton>
    </div>

    <UModal v-model="isCreateModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold text-foreground">Create Group Program</h3>
        </template>
        <div class="space-y-4">
          <UFormGroup label="Program Name" required>
            <UInput v-model="newProgramName" placeholder="e.g. UVic Tri Club" autofocus />
          </UFormGroup>
          <UFormGroup label="Description">
            <UTextarea
              v-model="newProgramDescription"
              placeholder="Optional details about this program..."
            />
          </UFormGroup>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" @click="isCreateModalOpen = false"
              >Cancel</UButton
            >
            <UButton color="primary" :disabled="!newProgramName" @click="createProgram"
              >Create</UButton
            >
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
