<template>
  <UDashboardPanel id="community-calendar">
    <template #header>
      <UDashboardNavbar title="Team Calendar">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <div
            class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700"
          >
            <UButton
              color="neutral"
              :variant="viewMode === 'list' ? 'solid' : 'ghost'"
              icon="i-lucide-list"
              class="rounded-md"
              @click="viewMode = 'list'"
            />
            <UButton
              color="neutral"
              :variant="viewMode === 'calendar' ? 'solid' : 'ghost'"
              icon="i-lucide-layout-grid"
              class="rounded-md"
              @click="viewMode = 'calendar'"
            />
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-0 sm:p-6">
        <div
          class="px-4 sm:px-0 mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <h1 class="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              Team Calendar
            </h1>
            <p
              class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mt-1 italic"
            >
              Shared races &amp; events from teammates
            </p>
          </div>
          <UButton to="/events" color="primary" icon="i-lucide-plus"> Add your event </UButton>
        </div>

        <div v-if="loading" class="flex justify-center py-20">
          <UIcon name="i-lucide-loader-2" class="animate-spin w-8 h-8 text-primary" />
        </div>

        <div v-else-if="viewMode === 'list'" class="space-y-6">
          <div v-if="events.length === 0" class="text-center py-12 space-y-3">
            <p class="text-gray-500">No shared team events yet.</p>
            <p class="text-sm text-gray-400 max-w-md mx-auto">
              When you add a race under Events, check
              <span class="font-medium text-gray-600 dark:text-gray-300"
                >Share on Team Calendar</span
              >
              so teammates can discover it and add it to their calendar.
            </p>
            <UButton to="/events" color="primary" variant="soft" icon="i-lucide-flag">
              Go to Events
            </UButton>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UCard v-for="event in events" :key="event.id" class="flex flex-col h-full">
              <template #header>
                <div class="flex justify-between items-start gap-2">
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                      <div class="text-xs font-bold text-primary uppercase tracking-wider">
                        {{ formatDate(event.date) }}
                      </div>
                      <UBadge
                        v-if="event.isPinned"
                        color="warning"
                        variant="subtle"
                        size="xs"
                        icon="i-lucide-pin"
                      >
                        Featured
                      </UBadge>
                      <UBadge
                        v-if="event.shareLevel === 'SUMMARY'"
                        color="neutral"
                        variant="subtle"
                        size="xs"
                      >
                        Summary
                      </UBadge>
                    </div>
                    <h3 class="font-bold text-lg leading-tight">{{ event.title }}</h3>
                  </div>
                  <div class="flex flex-col items-end gap-1 shrink-0">
                    <UBadge v-if="event.type" color="primary" variant="subtle" size="sm">
                      {{ event.type }}
                    </UBadge>
                    <UButton
                      v-if="canPin"
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      :icon="event.isPinned ? 'i-lucide-pin-off' : 'i-lucide-pin'"
                      :loading="pinning === event.id"
                      @click="togglePin(event)"
                    >
                      {{ event.isPinned ? 'Unpin' : 'Pin' }}
                    </UButton>
                  </div>
                </div>
              </template>

              <div class="flex-grow space-y-3">
                <p
                  v-if="event.description"
                  class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
                >
                  {{ event.description }}
                </p>
                <div class="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mt-4">
                  <div v-if="event.location || event.city" class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
                    {{ event.location || event.city }}
                  </div>
                  <div v-if="event.distance" class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-activity" class="w-4 h-4" />
                    {{ event.distance }} km
                  </div>
                </div>

                <div v-if="event.attendees?.length" class="flex items-center gap-2 pt-1">
                  <div class="flex -space-x-2">
                    <UAvatar
                      v-for="person in event.attendees.slice(0, 5)"
                      :key="person.userId"
                      :src="person.image || undefined"
                      :alt="person.name || 'Athlete'"
                      size="xs"
                    />
                  </div>
                  <span class="text-xs text-gray-500">
                    {{ attendeeLabel(event) }}
                  </span>
                </div>
                <p
                  v-else-if="event.hideAttendeeNames && event.attendeeCount > 0"
                  class="text-xs text-gray-500 pt-1"
                >
                  {{ event.attendeeCount }} teammates attending (names hidden)
                </p>
              </div>

              <template #footer>
                <div
                  class="flex justify-between items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800"
                >
                  <div class="text-sm text-gray-500 flex items-center gap-1.5">
                    <UIcon name="i-lucide-users" class="w-4 h-4" />
                    {{ event.attendeeCount }} attending
                  </div>
                  <UButton
                    :color="event.isOnMyCalendar ? 'primary' : 'neutral'"
                    :variant="event.isOnMyCalendar ? 'solid' : 'outline'"
                    :loading="toggling === event.id"
                    :disabled="isSharedByMe(event)"
                    size="sm"
                    @click="toggleAttendance(event)"
                  >
                    <UIcon
                      v-if="event.isOnMyCalendar"
                      name="i-lucide-check-circle-2"
                      class="w-4 h-4 mr-1"
                    />
                    {{
                      isSharedByMe(event)
                        ? 'Shared by you'
                        : event.isOnMyCalendar
                          ? 'On my calendar'
                          : 'Add to my Events'
                    }}
                  </UButton>
                </div>
              </template>
            </UCard>
          </div>
        </div>

        <div
          v-else
          class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
        >
          <div
            class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800"
          >
            <UButton
              icon="i-lucide-chevron-left"
              variant="ghost"
              color="neutral"
              @click="changeMonth(-1)"
            />
            <h2 class="font-bold text-lg">{{ monthName }} {{ currentYear }}</h2>
            <UButton
              icon="i-lucide-chevron-right"
              variant="ghost"
              color="neutral"
              @click="changeMonth(1)"
            />
          </div>

          <div class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
            <div
              v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
              :key="day"
              class="py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              {{ day }}
            </div>
          </div>

          <div class="grid grid-cols-7 auto-rows-fr">
            <div
              v-for="(cell, idx) in calendarCells"
              :key="idx"
              class="min-h-[100px] border-b border-r border-gray-100 dark:border-gray-800 p-1 lg:p-2"
              :class="{
                'bg-gray-50 dark:bg-gray-950/50': !cell.currentMonth,
                'bg-primary/5': cell.isToday
              }"
            >
              <div v-if="cell.date" class="h-full flex flex-col">
                <span
                  class="text-xs font-medium mb-1"
                  :class="{
                    'text-primary font-bold': cell.isToday,
                    'text-gray-400': !cell.currentMonth
                  }"
                >
                  {{ cell.day }}
                </span>
                <div class="space-y-1 overflow-y-auto max-h-[80px] pr-1">
                  <div
                    v-for="ev in eventsOnDate(cell.date)"
                    :key="ev.id"
                    class="text-[10px] px-1.5 py-1 rounded truncate cursor-pointer transition-colors"
                    :class="
                      ev.isOnMyCalendar
                        ? 'bg-primary text-white'
                        : ev.isPinned
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100'
                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                    "
                    :title="ev.title"
                    @click="toggleAttendance(ev)"
                  >
                    <span v-if="ev.isPinned" class="opacity-80">★ </span>{{ ev.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import type { CommunityEventListItem } from '~~/shared/community-events'

  definePageMeta({
    middleware: 'auth',
    layout: 'default'
  })

  useHead({
    title: 'Team Calendar',
    meta: [
      {
        name: 'description',
        content: 'Discover races teammates are doing and add them to your calendar.'
      }
    ]
  })

  const toast = useToast()
  const { data: session } = useAuth()
  const loading = ref(true)
  const events = ref<CommunityEventListItem[]>([])
  const viewMode = ref<'list' | 'calendar'>('list')
  const toggling = ref<string | null>(null)
  const pinning = ref<string | null>(null)
  const currentDate = ref(new Date())

  const myUserId = computed(() => (session.value as any)?.user?.id as string | undefined)
  const canPin = computed(() => {
    const u = (session.value as any)?.user
    return Boolean(u?.isCoach || u?.isAdmin || u?.role === 'ADMIN')
  })

  function isSharedByMe(event: CommunityEventListItem) {
    return !!myUserId.value && event.createdBy?.id === myUserId.value
  }

  const currentMonth = computed(() => currentDate.value.getMonth())
  const currentYear = computed(() => currentDate.value.getFullYear())
  const monthName = computed(() => currentDate.value.toLocaleString('default', { month: 'long' }))

  async function fetchEvents() {
    loading.value = true
    try {
      events.value = await $fetch<CommunityEventListItem[]>('/api/community/events')
    } catch (error) {
      console.error('Error fetching community events:', error)
      toast.add({
        title: 'Error',
        description: 'Failed to load team calendar',
        color: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  function attendeeLabel(event: CommunityEventListItem) {
    const names = event.attendees
      .map((a) => a.name?.split(' ')[0])
      .filter(Boolean)
      .slice(0, 3)
    if (!names.length) return `${event.attendeeCount} teammates`
    const extra = event.attendeeCount - names.length
    return extra > 0 ? `${names.join(', ')} +${extra}` : names.join(', ')
  }

  async function togglePin(event: CommunityEventListItem) {
    pinning.value = event.id
    try {
      await $fetch(`/api/community/events/${event.id}/pin`, {
        method: 'POST',
        body: { pinned: !event.isPinned }
      })
      await fetchEvents()
      toast.add({
        title: event.isPinned ? 'Unpinned' : 'Pinned to Team Calendar',
        color: 'success'
      })
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.data?.message || 'Failed to update pin',
        color: 'error'
      })
    } finally {
      pinning.value = null
    }
  }

  async function toggleAttendance(event: CommunityEventListItem) {
    if (isSharedByMe(event)) return

    const joining = !event.isOnMyCalendar
    toggling.value = event.id

    try {
      await $fetch(`/api/community/events/${event.id}/attend`, {
        method: 'POST',
        body: { attending: joining }
      })

      await fetchEvents()

      toast.add({
        title: joining ? 'Added to your Events' : 'Removed from calendar',
        description: joining
          ? `${event.title} is on your training calendar and you’re on the attendee list.`
          : `You’re no longer attending ${event.title}.`,
        color: 'success'
      })
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.data?.message || 'Failed to update attendance',
        color: 'error'
      })
    } finally {
      toggling.value = null
    }
  }

  function changeMonth(delta: number) {
    currentDate.value = new Date(currentYear.value, currentMonth.value + delta, 1)
  }

  function eventsOnDate(date: Date) {
    return events.value.filter((e) => {
      const d = new Date(e.date)
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      )
    })
  }

  const calendarCells = computed(() => {
    const cells: Array<{
      date: Date
      day: number
      currentMonth: boolean
      isToday: boolean
    }> = []
    const year = currentYear.value
    const month = currentMonth.value

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const firstDayWeekday = firstDayOfMonth.getDay()

    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        day: prevMonthLastDay - i,
        currentMonth: false,
        isToday: false
      })
    }

    const today = new Date()
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i)
      cells.push({
        date,
        day: i,
        currentMonth: true,
        isToday: date.toDateString() === today.toDateString()
      })
    }

    const remainingCells = 42 - cells.length
    for (let i = 1; i <= remainingCells; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        day: i,
        currentMonth: false,
        isToday: false
      })
    }

    return cells
  })

  onMounted(() => {
    fetchEvents()
  })
</script>
