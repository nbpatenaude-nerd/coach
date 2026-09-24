<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Workout Title">
        <UInput v-model="localTemplate.title" placeholder="e.g. 4x8 Threshold Intervals" />
      </UFormField>

      <UFormField label="Type">
        <USelect
          v-model="localTemplate.type"
          :items="workoutTypeOptions"
          value-key="value"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Category">
        <UInput v-model="localTemplate.category" placeholder="e.g. Threshold, VO2Max" />
      </UFormField>

      <UFormField label="Sport">
        <USelect
          v-model="localTemplate.sport"
          :items="sportOptions"
          value-key="value"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Folder">
        <USelect v-model="localTemplate.folderId" :items="folderOptions" placeholder="Unfiled" />
      </UFormField>
    </div>

    <UFormField label="Description">
      <UTextarea
        v-model="localTemplate.description"
        autoresize
        placeholder="Describe the session's intent..."
      />
    </UFormField>

    <USeparator />

    <div class="space-y-4">
      <h3 class="text-sm font-black uppercase tracking-widest text-primary">Workout Structure</h3>
      <WorkoutStepsEditor
        :steps="editorSteps"
        :saving="saving"
        @update:steps="onStepsUpdate"
        @save="onStepsSave"
        @cancel="() => {}"
      />
    </div>

    <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
      <UButton
        color="neutral"
        variant="ghost"
        @click="
          () => {
            void $emit('cancel')
          }
        "
        >Cancel</UButton
      >
      <UButton
        color="primary"
        :loading="saving"
        @click="
          () => {
            void saveTemplate()
          }
        "
        >Save Template</UButton
      >
    </div>
  </div>
</template>

<script setup lang="ts">
  import WorkoutStepsEditor from '~/components/workouts/planned/WorkoutStepsEditor.vue'

  const props = defineProps<{
    template?: any
    ownerScope?: 'athlete' | 'coach'
  }>()

  const emit = defineEmits(['save', 'cancel'])
  const toast = useToast()
  const saving = ref(false)
  const activeOwnerScope = computed(
    () => props.template?.ownerScope || props.ownerScope || 'athlete'
  )
  const { flat, ensureFoldersLoaded } = useWorkoutTemplateFolders('editor', {
    librarySource: activeOwnerScope
  })

  const WORKOUT_TYPES = ['Ride', 'VirtualRide', 'Run', 'Swim', 'WeightTraining', 'Hike', 'Walk']
  const workoutTypeOptions = WORKOUT_TYPES.map((type) => ({ label: type, value: type }))
  const sportOptions = [
    { label: 'Cycling', value: 'Cycling' },
    { label: 'Running', value: 'Running' },
    { label: 'Swimming', value: 'Swimming' },
    { label: 'Strength', value: 'Strength' }
  ]

  function normalizeIncomingSteps(steps: any[] | undefined) {
    if (!Array.isArray(steps)) return []
    return steps.map((step) => {
      // Legacy template editor used duration minutes + intensity % FTP.
      if (step.power || step.heartRate || step.pace || step.rpe || step.durationSeconds) {
        return step
      }
      const durationMin = Number(step.duration || 0)
      const intensityPct = Number(step.intensity || 70)
      return {
        name: step.name || 'Step',
        type:
          step.type === 'REST'
            ? 'Rest'
            : step.type === 'WARMUP'
              ? 'Warmup'
              : step.type === 'COOLDOWN'
                ? 'Cooldown'
                : 'Active',
        durationSeconds: Math.round(durationMin * 60),
        duration: Math.round(durationMin * 60),
        power: { value: intensityPct / 100, units: '%' },
        primaryTarget: 'power'
      }
    })
  }

  const localTemplate = ref(
    props.template
      ? {
          ...JSON.parse(JSON.stringify(props.template)),
          structuredWorkout: {
            ...(props.template.structuredWorkout || {}),
            steps: normalizeIncomingSteps(props.template.structuredWorkout?.steps)
          }
        }
      : {
          title: '',
          description: '',
          type: 'Ride',
          sport: 'Cycling',
          folderId: null,
          category: '',
          structuredWorkout: {
            steps: []
          },
          ownerScope: props.ownerScope || 'athlete'
        }
  )

  // Stable steps ref so the editor does not receive a fresh `[]` each render
  // and so parent↔child updates do not wipe in-progress edits.
  const editorSteps = ref<any[]>(
    Array.isArray(localTemplate.value.structuredWorkout?.steps)
      ? localTemplate.value.structuredWorkout.steps
      : []
  )

  const folderOptions = computed(() => [
    { label: 'Unfiled', value: null },
    ...flat.value.map((folder) => ({
      label: folder.name,
      value: folder.id
    }))
  ])

  onMounted(() => {
    void ensureFoldersLoaded()
  })

  function onStepsUpdate(steps: any[]) {
    editorSteps.value = steps
    if (!localTemplate.value.structuredWorkout) {
      localTemplate.value.structuredWorkout = { steps: [] }
    }
    localTemplate.value.structuredWorkout.steps = steps
  }

  function onStepsSave(steps: any[]) {
    onStepsUpdate(steps)
    void saveTemplate()
  }

  async function saveTemplate() {
    if (!localTemplate.value.title) {
      toast.add({ title: 'Title required', color: 'error' })
      return
    }

    if (!localTemplate.value.structuredWorkout) {
      localTemplate.value.structuredWorkout = { steps: [] }
    }
    localTemplate.value.structuredWorkout.steps = editorSteps.value

    saving.value = true
    try {
      const isNew = !localTemplate.value.id
      const url = isNew
        ? '/api/library/workouts'
        : `/api/library/workouts/${localTemplate.value.id}`
      const method = isNew ? 'POST' : 'PATCH'

      await $fetch<any, string & {}>(url, {
        method,
        body: {
          ...localTemplate.value,
          ownerScope: activeOwnerScope.value
        }
      })

      toast.add({
        title: isNew ? 'Template Created' : 'Template Updated',
        color: 'success'
      })
      emit('save')
    } catch (error: any) {
      toast.add({
        title: 'Save Failed',
        description: error.data?.message || 'Unknown error',
        color: 'error'
      })
    } finally {
      saving.value = false
    }
  }
</script>
