<template>
  <UDashboardPanel id="exercise-dictionary">
    <template #header>
      <UDashboardNavbar title="Exercise Dictionary">
        <template #right>
          <UButton
            color="primary"
            icon="i-heroicons-plus"
            label="New Exercise"
            @click="isModalOpen = true"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="px-4 py-4 sm:px-6">
        <div class="mb-6 flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-black uppercase tracking-tight">Exercise Dictionary</h1>
            <p class="text-xs font-bold text-muted uppercase tracking-[0.2em] mt-1 italic">
              Manage core exercises for your programs
            </p>
          </div>
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search exercises..."
            class="w-full md:w-64"
          />
        </div>

        <div v-if="pending" class="space-y-4">
          <USkeleton v-for="i in 5" :key="i" class="h-16 w-full" />
        </div>

        <div v-else-if="exercises?.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <UCard v-for="ex in exercises" :key="ex.id" class="flex flex-col h-full">
            <template #header>
              <h3 class="text-sm font-bold uppercase tracking-tight">{{ ex.title }}</h3>
            </template>
            <div class="space-y-2 flex-grow">
              <div v-if="ex.primaryMuscle" class="text-xs">
                <span class="font-bold text-muted">Primary:</span>
                {{ ex.primaryMuscle }}
              </div>
              <div v-if="ex.type" class="text-xs">
                <span class="font-bold text-muted">Type:</span>
                {{ ex.type }}
              </div>
              <div v-if="ex.instructions" class="text-xs text-muted line-clamp-3">
                {{ ex.instructions }}
              </div>
            </div>
          </UCard>
        </div>

        <div
          v-else
          class="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800"
        >
          <UIcon name="i-heroicons-book-open" class="w-12 h-12 text-gray-400 mb-4 mx-auto" />
          <h3 class="text-lg font-bold">No exercises found</h3>
          <p class="text-sm text-muted">
            Create your first exercise to start building the dictionary.
          </p>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- New Exercise Modal -->
  <UModal
    v-model:open="isModalOpen"
    title="New Exercise"
    description="Add a new exercise to the global dictionary."
  >
    <template #body>
      <form class="space-y-4 p-4" @submit.prevent="submitExercise">
        <UFormField label="Title">
          <UInput v-model="form.title" placeholder="e.g. Barbell Squat" required />
        </UFormField>
        <UFormField label="Primary Muscle">
          <UInput v-model="form.primaryMuscle" placeholder="e.g. Quadriceps" />
        </UFormField>
        <UFormField label="Type">
          <UInput v-model="form.type" placeholder="e.g. Compound" />
        </UFormField>
        <UFormField label="Instructions">
          <UTextarea
            v-model="form.instructions"
            placeholder="How to perform this exercise..."
            :rows="3"
          />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <UButton color="neutral" variant="ghost" @click="isModalOpen = false">Cancel</UButton>
        <UButton color="primary" :loading="saving" @click="submitExercise">Save Exercise</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  const searchQuery = ref('')
  const isModalOpen = ref(false)
  const saving = ref(false)
  const toast = useToast()

  const form = reactive({
    title: '',
    primaryMuscle: '',
    type: '',
    instructions: ''
  })

  // Fetch exercises
  const {
    data: exercises,
    pending,
    refresh
  } = useFetch<any[]>('/api/exercises', {
    query: computed(() => ({ search: searchQuery.value })),
    watch: [searchQuery]
  })

  async function submitExercise() {
    if (!form.title.trim()) {
      toast.add({ title: 'Title required', color: 'error' })
      return
    }

    saving.value = true
    try {
      await $fetch('/api/exercises', {
        method: 'POST',
        body: form
      })
      toast.add({ title: 'Exercise created', color: 'success' })
      isModalOpen.value = false
      form.title = ''
      form.primaryMuscle = ''
      form.type = ''
      form.instructions = ''
      await refresh()
    } catch (e: any) {
      toast.add({ title: 'Failed to create exercise', description: e.message, color: 'error' })
    } finally {
      saving.value = false
    }
  }

  useHead({
    title: 'Exercise Dictionary'
  })
</script>
