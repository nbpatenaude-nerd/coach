<script setup lang="ts">
  export type SidebarAthlete = {
    id: string
    name?: string | null
  }

  export type SidebarGroup = {
    id: string
    name: string
    members?: Array<{ athleteId: string }>
    _count?: { members?: number }
  }

  const props = defineProps<{
    athletes: SidebarAthlete[]
    groups: SidebarGroup[]
    modelValue: string | null
    loading?: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [id: string | null]
  }>()

  const STORAGE_KEY = 'check-in-analysis:open-groups'

  const openGroupIds = ref<Set<string>>(new Set())

  onMounted(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as string[]
        if (Array.isArray(parsed) && parsed.length) {
          openGroupIds.value = new Set(parsed)
          return
        }
      }
    } catch {
      // ignore
    }
    // Default: expand groups that have members (+ ungrouped when present).
    const defaults = new Set<string>()
    for (const section of groupSections.value) {
      if (section.members.length) defaults.add(section.id)
    }
    if (ungroupedAthletes.value.length) defaults.add('__ungrouped__')
    openGroupIds.value = defaults
  })

  watch(
    openGroupIds,
    (set) => {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
      } catch {
        // ignore
      }
    },
    { deep: true }
  )

  const athleteById = computed(() => {
    const map = new Map<string, SidebarAthlete>()
    for (const a of props.athletes) map.set(a.id, a)
    return map
  })

  const groupedAthleteIds = computed(() => {
    const ids = new Set<string>()
    for (const g of props.groups) {
      for (const m of g.members ?? []) ids.add(m.athleteId)
    }
    return ids
  })

  const ungroupedAthletes = computed(() =>
    props.athletes.filter((a) => !groupedAthleteIds.value.has(a.id))
  )

  const groupSections = computed(() =>
    props.groups.map((group) => {
      const members = (group.members ?? [])
        .map((m) => athleteById.value.get(m.athleteId))
        .filter((a): a is SidebarAthlete => Boolean(a))
      return {
        id: group.id,
        name: group.name,
        members,
        count: group._count?.members ?? members.length
      }
    })
  )

  // Ensure the selected athlete's group(s) are expanded.
  watch(
    () => props.modelValue,
    (id) => {
      if (!id) return
      for (const section of groupSections.value) {
        if (section.members.some((m) => m.id === id)) {
          openGroupIds.value.add(section.id)
        }
      }
      if (ungroupedAthletes.value.some((a) => a.id === id)) {
        openGroupIds.value.add('__ungrouped__')
      }
    },
    { immediate: true }
  )

  function isOpen(id: string) {
    return openGroupIds.value.has(id)
  }

  function toggleGroup(id: string) {
    const next = new Set(openGroupIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    openGroupIds.value = next
  }

  function selectAthlete(id: string) {
    emit('update:modelValue', id)
  }
</script>

<template>
  <div class="flex flex-col gap-2">
    <h2 class="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-xs">
      Select Athlete
    </h2>

    <div v-if="loading" class="text-sm text-gray-500 text-center py-6">Loading…</div>
    <div v-else-if="!athletes.length" class="text-sm text-gray-500">No athletes found.</div>

    <div v-else class="flex flex-col gap-1">
      <div v-for="section in groupSections" :key="section.id" class="rounded-lg">
        <button
          type="button"
          class="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
          @click="toggleGroup(section.id)"
        >
          <UIcon
            :name="isOpen(section.id) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
            class="h-3.5 w-3.5 shrink-0"
          />
          <span class="min-w-0 flex-1 truncate">{{ section.name }}</span>
          <span class="tabular-nums text-[10px] text-gray-400">({{ section.count }})</span>
        </button>

        <div v-if="isOpen(section.id)" class="mt-0.5 flex flex-col gap-0.5 pl-1">
          <p v-if="!section.members.length" class="px-2 py-1 text-[11px] italic text-gray-400">
            No members
          </p>
          <button
            v-for="athlete in section.members"
            :key="athlete.id"
            type="button"
            class="flex w-full items-center gap-2 rounded-md border px-1.5 py-1.5 text-left transition-colors"
            :class="
              modelValue === athlete.id
                ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-200'
                : 'border-transparent text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900'
            "
            @click="selectAthlete(athlete.id)"
          >
            <div
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
              :class="
                modelValue === athlete.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
              "
            >
              {{ athlete.name ? athlete.name.charAt(0).toUpperCase() : 'U' }}
            </div>
            <span class="truncate text-sm font-medium">{{ athlete.name || 'Unnamed' }}</span>
          </button>
        </div>
      </div>

      <div v-if="ungroupedAthletes.length" class="rounded-lg pt-1">
        <button
          type="button"
          class="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
          @click="toggleGroup('__ungrouped__')"
        >
          <UIcon
            :name="isOpen('__ungrouped__') ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
            class="h-3.5 w-3.5 shrink-0"
          />
          <span class="min-w-0 flex-1 truncate">Ungrouped</span>
          <span class="tabular-nums text-[10px] text-gray-400"
            >({{ ungroupedAthletes.length }})</span
          >
        </button>
        <div v-if="isOpen('__ungrouped__')" class="mt-0.5 flex flex-col gap-0.5 pl-1">
          <button
            v-for="athlete in ungroupedAthletes"
            :key="athlete.id"
            type="button"
            class="flex w-full items-center gap-2 rounded-md border px-1.5 py-1.5 text-left transition-colors"
            :class="
              modelValue === athlete.id
                ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-200'
                : 'border-transparent text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900'
            "
            @click="selectAthlete(athlete.id)"
          >
            <div
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
              :class="
                modelValue === athlete.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
              "
            >
              {{ athlete.name ? athlete.name.charAt(0).toUpperCase() : 'U' }}
            </div>
            <span class="truncate text-sm font-medium">{{ athlete.name || 'Unnamed' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
