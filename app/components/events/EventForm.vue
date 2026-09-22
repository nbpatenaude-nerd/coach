<template>
  <UForm :state="state" :schema="schema" class="space-y-6" @submit="onSubmit">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Title & Type -->
      <UFormField label="Event Title" name="title" required>
        <UInput v-model="state.title" placeholder="e.g. London Marathon" class="w-full" />
      </UFormField>

      <UFormField label="Event Type" name="type">
        <USelect
          v-model="state.type"
          :items="typeOptions"
          placeholder="Select type"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Sub-Type" name="subType">
        <USelect
          v-model="state.subType"
          :items="subTypeOptions"
          placeholder="Select sub-type"
          class="w-full"
        />
      </UFormField>

      <!-- Date & Priority -->
      <UFormField label="Date" name="date" required>
        <UInput v-model="state.date" type="date" class="w-full" />
      </UFormField>

      <UFormField label="Start Time" name="startTime">
        <UInput v-model="state.startTime" type="time" class="w-full" />
      </UFormField>

      <UFormField label="Race Priority" name="priority">
        <USelect v-model="state.priority" :items="priorityOptions" class="w-full" />
      </UFormField>

      <!-- Location -->
      <UFormField label="City" name="city">
        <UInput v-model="state.city" placeholder="e.g. London" class="w-full" />
      </UFormField>

      <UFormField label="Country" name="country">
        <UInput v-model="state.country" placeholder="e.g. United Kingdom" class="w-full" />
      </UFormField>

      <UFormField label="Location/Venue" name="location">
        <UInput v-model="state.location" placeholder="e.g. Greenwich Park" class="w-full" />
      </UFormField>

      <UFormField label="Website URL" name="websiteUrl">
        <UInput v-model="state.websiteUrl" placeholder="https://..." class="w-full" />
      </UFormField>

      <!-- Options -->
      <div class="flex flex-col gap-3 pt-4 md:col-span-2">
        <div class="flex flex-wrap items-center gap-6">
          <UCheckbox
            v-model="state.isVirtual"
            label="Virtual Event"
            :ui="{ label: 'whitespace-nowrap' }"
          />
          <UCheckbox
            v-model="state.isPublic"
            label="Share on Team Calendar"
            :ui="{ label: 'whitespace-nowrap' }"
          />
        </div>
        <div
          v-if="state.isPublic"
          class="rounded-lg border border-gray-200 dark:border-gray-800 p-3 space-y-3 bg-gray-50/80 dark:bg-gray-900/40"
        >
          <UFormField label="What teammates see" name="shareLevel">
            <USelect
              v-model="state.shareLevel"
              :items="shareLevelOptions"
              class="w-full max-w-md"
            />
          </UFormField>
          <UCheckbox
            v-model="state.hideAttendeeNames"
            label="Hide attendee names on Team Calendar"
          />
        </div>
      </div>
    </div>

    <!-- Description -->
    <UFormField label="Description" name="description">
      <UTextarea
        v-model="state.description"
        placeholder="Additional details about the event..."
        class="w-full"
      />
    </UFormField>

    <!-- Course Profile -->
    <div class="space-y-4">
      <h4 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
        Course Profile
      </h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <UFormField label="Distance (km)" name="distance">
          <UInputNumber v-model="state.distance" placeholder="138" class="w-full" />
        </UFormField>

        <UFormField label="Elevation (m)" name="elevation">
          <UInputNumber v-model="state.elevation" placeholder="4230" class="w-full" />
        </UFormField>

        <UFormField label="Duration (h)" name="expectedDuration">
          <UInputNumber
            v-model="state.expectedDuration"
            placeholder="6.5"
            :step="0.1"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Terrain" name="terrain">
          <USelect
            v-model="state.terrain"
            :items="['Flat', 'Rolling', 'Hilly', 'Mountainous', 'Technical']"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <!-- Goals Link -->
    <UFormField label="Link to Goals" name="goalIds">
      <USelect
        v-model="state.goalIds"
        :items="goalOptions"
        multiple
        placeholder="Select goals to link"
        class="w-full"
      />
    </UFormField>

    <div class="flex justify-end gap-3 pt-4">
      <UButton
        label="Cancel"
        color="neutral"
        variant="ghost"
        @click="
          () => {
            void $emit('cancel')
          }
        "
      />
      <UButton
        type="submit"
        :label="isEditing ? 'Update Event' : 'Create Event'"
        color="primary"
        :loading="loading"
      />
    </div>
  </UForm>

  <UModal v-model:open="showMatchModal" title="Teammates already doing this?">
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          We found similar events on the Team Calendar. Join one to share the attendee list, or
          create yours separately.
        </p>
        <div class="space-y-2">
          <button
            v-for="match in matchCandidates"
            :key="match.id"
            type="button"
            class="w-full text-left rounded-lg border p-3 transition-colors"
            :class="
              selectedMatchId === match.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 dark:border-gray-800 hover:border-primary/40'
            "
            @click="selectedMatchId = match.id"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">{{ match.title }}</p>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ formatMatchDate(match.date) }}
                  <span v-if="match.city"> · {{ match.city }}</span>
                </p>
              </div>
              <div class="text-right shrink-0">
                <UBadge v-if="match.isPinned" color="warning" variant="subtle" size="xs"
                  >Pinned</UBadge
                >
                <p class="text-xs text-gray-500 mt-1">{{ match.attendeeCount }} attending</p>
                <p class="text-[10px] text-gray-400">{{ Math.round(match.score * 100) }}% match</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-wrap justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="showMatchModal = false">Cancel</UButton>
        <UButton color="neutral" variant="soft" :loading="loading" @click="createSeparately">
          Create separately
        </UButton>
        <UButton
          color="primary"
          :disabled="!selectedMatchId"
          :loading="loading"
          @click="joinSelectedMatch"
        >
          Join selected
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { z } from 'zod'
  import type { CommunityEventMatchCandidate } from '~~/shared/community-events'

  const props = defineProps<{
    initialData?: any
  }>()

  const emit = defineEmits(['success', 'cancel'])

  const loading = ref(false)
  const toast = useToast()
  const { getUserLocalDate, formatUserDate, timezone } = useFormat()

  const showMatchModal = ref(false)
  const matchCandidates = ref<CommunityEventMatchCandidate[]>([])
  const selectedMatchId = ref<string | null>(null)

  const state = reactive({
    title: '',
    description: '',
    date: getUserLocalDate().toISOString().split('T')[0],
    startTime: '',
    type: 'Run',
    subType: '',
    priority: 'B',
    city: '',
    country: '',
    location: '',
    websiteUrl: '',
    distance: undefined as number | undefined,
    elevation: undefined as number | undefined,
    expectedDuration: undefined as number | undefined,
    terrain: 'Rolling',
    isVirtual: false,
    isPublic: false,
    shareLevel: 'FULL' as 'FULL' | 'SUMMARY',
    hideAttendeeNames: false,
    goalIds: [] as string[]
  })

  const shareLevelOptions = [
    { label: 'Full details (course, links, description)', value: 'FULL' },
    { label: 'Title & date only', value: 'SUMMARY' }
  ]

  const isEditing = computed(() => !!props.initialData)

  // Populate state when initialData changes
  watch(
    () => props.initialData,
    (newData) => {
      if (newData) {
        state.title = newData.title || ''
        state.description = newData.description || ''
        state.date = newData.date
          ? formatUserDate(newData.date, timezone.value, 'yyyy-MM-dd')
          : getUserLocalDate().toISOString().split('T')[0]
        state.startTime = newData.startTime || ''
        state.type = newData.type || 'Run'
        state.subType = newData.subType || ''
        state.priority = newData.priority || ''
        state.city = newData.city || ''
        state.country = newData.country || ''
        state.location = newData.location || ''
        state.websiteUrl = newData.websiteUrl || ''
        state.distance = newData.distance
        state.elevation = newData.elevation
        state.expectedDuration = newData.expectedDuration
        state.terrain = newData.terrain || 'Rolling'
        state.isVirtual = newData.isVirtual || false
        state.isPublic = newData.isPublic || false
        state.shareLevel = newData.shareLevel || 'FULL'
        state.hideAttendeeNames = newData.hideAttendeeNames || false
        state.goalIds = newData.goals ? newData.goals.map((g: any) => g.id || g) : []
      } else {
        state.title = ''
        state.description = ''
        state.date = getUserLocalDate().toISOString().split('T')[0]
        state.startTime = ''
        state.type = 'Run'
        state.subType = ''
        state.priority = 'B'
        state.city = ''
        state.country = ''
        state.location = ''
        state.websiteUrl = ''
        state.distance = undefined
        state.elevation = undefined
        state.expectedDuration = undefined
        state.terrain = 'Rolling'
        state.isVirtual = false
        state.isPublic = false
        state.shareLevel = 'FULL'
        state.hideAttendeeNames = false
        state.goalIds = []
      }
    },
    { immediate: true }
  )

  const schema = z.object({
    title: z.string().min(1, 'Title is required'),
    date: z.string().min(1, 'Date is required'),
    websiteUrl: z.string().url('Must be a valid URL').optional().or(z.literal(''))
  })

  const typeOptions = [
    { label: 'Run', value: 'Run' },
    { label: 'Ride', value: 'Ride' },
    { label: 'Swim', value: 'Swim' },
    { label: 'Triathlon', value: 'Triathlon' },
    { label: 'Other', value: 'Other' }
  ]

  const subTypesByMainType: Record<string, { label: string; value: string }[]> = {
    Run: [
      { label: 'Running (5k)', value: 'Running (5k)' },
      { label: 'Running (10k)', value: 'Running (10k)' },
      { label: 'Half Marathon', value: 'Half Marathon' },
      { label: 'Marathon', value: 'Marathon' },
      { label: 'Ultra', value: 'Ultra' },
      { label: 'Trail Run', value: 'Trail Run' }
    ],
    Ride: [
      { label: 'Road Race', value: 'Road Race' },
      { label: 'Criterium', value: 'Criterium' },
      { label: 'Time Trial', value: 'Time Trial' },
      { label: 'Gran Fondo', value: 'Gran Fondo' },
      { label: 'MTB (XC)', value: 'MTB (XC)' },
      { label: 'MTB (Marathon)', value: 'MTB (Marathon)' },
      { label: 'Gravel', value: 'Gravel' },
      { label: 'Cyclocross', value: 'Cyclocross' },
      { label: 'Social Ride', value: 'Social Ride' },
      { label: 'Cyclotour (Toertocht)', value: 'Cyclotour' }
    ],
    Swim: [
      { label: 'Pool Race', value: 'Pool Race' },
      { label: 'Open Water', value: 'Open Water' }
    ],
    Triathlon: [
      { label: 'Triathlon (Sprint)', value: 'Triathlon (Sprint)' },
      { label: 'Triathlon (Olympic)', value: 'Triathlon (Olympic)' },
      { label: 'Triathlon (70.3)', value: 'Triathlon (70.3)' },
      { label: 'Triathlon (Full)', value: 'Triathlon (Full)' },
      { label: 'Duathlon', value: 'Duathlon' },
      { label: 'Aquathlon', value: 'Aquathlon' }
    ],
    Other: [{ label: 'Other', value: 'Other' }]
  }

  const subTypeOptions = computed(() => {
    if (!state.type) return subTypesByMainType['Other']
    return subTypesByMainType[state.type] || subTypesByMainType['Other']
  })

  watch(
    () => state.type,
    (newType) => {
      if (!newType) return
      const options = subTypesByMainType[newType] || []
      if (!options.find((o) => o.value === state.subType)) {
        state.subType = options[0]?.value || ''
      }
    }
  )

  const priorityOptions = [
    { label: 'None', value: 'NONE' },
    { label: 'A Race (Main Goal)', value: 'A' },
    { label: 'B Race (Preparation)', value: 'B' },
    { label: 'C Race (Training)', value: 'C' }
  ]

  const goalOptions = ref<{ label: string; value: string }[]>([])

  async function fetchGoals() {
    try {
      const response = await ($fetch as any)('/api/goals')
      const goals = Array.isArray(response) ? response : response.goals || []

      goalOptions.value = goals.map((g: any) => ({
        label: g.title,
        value: g.id
      }))
    } catch (error) {
      console.error('Error fetching goals:', error)
    }
  }

  function buildEventDateIso() {
    const [year, month, day] = state.date.split('-').map(Number)
    if (year === undefined || month === undefined || day === undefined) {
      throw new Error('Invalid date format')
    }
    return new Date(Date.UTC(year, month - 1, day)).toISOString()
  }

  function formatMatchDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  async function saveEvent(extra: Record<string, unknown> = {}) {
    const payload = {
      ...state,
      date: buildEventDateIso(),
      ...extra
    }

    if (isEditing.value && props.initialData?.id) {
      await $fetch(`/api/events/${props.initialData.id}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      await $fetch('/api/events', {
        method: 'POST',
        body: payload
      })
    }
    showMatchModal.value = false
    emit('success')
  }

  async function onSubmit() {
    if (!state.date) return

    loading.value = true
    try {
      if (!isEditing.value) {
        const { matches } = await $fetch<{ matches: CommunityEventMatchCandidate[] }>(
          '/api/community/events/match',
          {
            method: 'POST',
            body: {
              title: state.title,
              date: buildEventDateIso(),
              city: state.city || null,
              location: state.location || null,
              country: state.country || null
            }
          }
        )

        if (matches.length > 0) {
          matchCandidates.value = matches
          selectedMatchId.value = matches[0]?.id ?? null
          showMatchModal.value = true
          return
        }
      }

      await saveEvent()
    } catch (error: any) {
      console.error('Error saving event:', error)
      toast.add({
        title: 'Error',
        description: error.data?.message || 'Failed to save event',
        color: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  async function joinSelectedMatch() {
    if (!selectedMatchId.value) return
    loading.value = true
    try {
      await saveEvent({
        joinTeamEventId: selectedMatchId.value,
        isPublic: false
      })
      toast.add({
        title: 'Joined team event',
        description: 'It’s on your calendar and you’re on the attendee list.',
        color: 'success'
      })
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error.data?.message || 'Failed to join event',
        color: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  async function createSeparately() {
    loading.value = true
    try {
      await saveEvent({ skipCommunityDedupe: true })
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error.data?.message || 'Failed to save event',
        color: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchGoals()
  })
</script>
