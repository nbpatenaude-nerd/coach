<template>
  <UDashboardPanel id="community-calendar">
    <template #header>
      <UDashboardNavbar title="Community Calendar">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <div class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
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
        <div class="px-4 sm:px-0 mb-6">
          <h1 class="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Community Calendar
          </h1>
          <p class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mt-1 italic">
            Team Events & Group Rides
          </p>
        </div>

        <div v-if="loading" class="flex justify-center py-20">
          <UIcon name="i-lucide-loader-2" class="animate-spin w-8 h-8 text-primary" />
        </div>

        <div v-else-if="viewMode === 'list'" class="space-y-6">
          <div v-if="events.length === 0" class="text-center py-12 text-gray-500">
            No community events found.
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UCard v-for="event in events" :key="event.id" class="flex flex-col h-full">
              <template #header>
                <div class="flex justify-between items-start">
                  <div>
                    <div class="text-xs font-bold text-primary mb-1 uppercase tracking-wider">
                      {{ formatDate(event.date) }}
                    </div>
                    <h3 class="font-bold text-lg leading-tight">{{ event.title }}</h3>
                  </div>
                  <UBadge v-if="event.type" color="primary" variant="subtle" size="sm">{{ event.type }}</UBadge>
                </div>
              </template>
              
              <div class="flex-grow space-y-3">
                <p v-if="event.description" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {{ event.description }}
                </p>
                <div class="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mt-4">
                  <div class="flex items-center gap-1.5" v-if="event.location">
                    <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
                    {{ event.location }}
                  </div>
                  <div class="flex items-center gap-1.5" v-if="event.distance">
                    <UIcon name="i-lucide-activity" class="w-4 h-4" />
                    {{ event.distance }} km
                  </div>
                </div>
              </div>

              <template #footer>
                <div class="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div class="text-sm text-gray-500 flex items-center gap-1.5">
                    <UIcon name="i-lucide-users" class="w-4 h-4" />
                    {{ event.EventParticipant?.length || 0 }} attending
                  </div>
                  <UButton
                    :color="isAttending(event) ? 'primary' : 'neutral'"
                    :variant="isAttending(event) ? 'solid' : 'outline'"
                    @click="toggleAttendance(event)"
                    :loading="toggling === event.id"
                  >
                    <UIcon v-if="isAttending(event)" name="i-lucide-check-circle-2" class="w-4 h-4 mr-1" />
                    {{ isAttending(event) ? 'Attending' : 'RSVP' }}
                  </UButton>
                </div>
              </template>
            </UCard>
          </div>
        </div>

        <div v-else class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <UButton icon="i-lucide-chevron-left" variant="ghost" color="neutral" @click="changeMonth(-1)" />
            <h2 class="font-bold text-lg">{{ monthName }} {{ currentYear }}</h2>
            <UButton icon="i-lucide-chevron-right" variant="ghost" color="neutral" @click="changeMonth(1)" />
          </div>
          
          <div class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
            <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" 
                 class="py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
              {{ day }}
            </div>
          </div>
          
          <div class="grid grid-cols-7 auto-rows-fr">
            <div v-for="(cell, idx) in calendarCells" :key="idx" 
                 class="min-h-[100px] border-b border-r border-gray-100 dark:border-gray-800 p-1 lg:p-2"
                 :class="{ 'bg-gray-50 dark:bg-gray-950/50': !cell.currentMonth, 'bg-primary/5': cell.isToday }">
              <div v-if="cell.date" class="h-full flex flex-col">
                <span class="text-xs font-medium mb-1" :class="{ 'text-primary font-bold': cell.isToday, 'text-gray-400': !cell.currentMonth }">
                  {{ cell.day }}
                </span>
                <div class="space-y-1 overflow-y-auto max-h-[80px] pr-1">
                  <div v-for="ev in eventsOnDate(cell.date)" :key="ev.id"
                       class="text-[10px] px-1.5 py-1 rounded truncate cursor-pointer transition-colors"
                       :class="isAttending(ev) ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'"
                       @click="toggleAttendance(ev)">
                    {{ ev.title }}
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
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

useHead({
  title: 'Community Calendar',
  meta: [{ name: 'description', content: 'Join team events and group rides.' }]
})

const toast = useToast()
const { data: session } = useAuth()
const loading = ref(true)
const events = ref<any[]>([])
const viewMode = ref<'list' | 'calendar'>('list')
const toggling = ref<string | null>(null)

const currentDate = ref(new Date())

const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())
const monthName = computed(() => currentDate.value.toLocaleString('default', { month: 'long' }))

async function fetchEvents() {
  loading.value = true
  try {
    const data = await $fetch<any[]>('/api/community/events')
    events.value = data
  } catch (error) {
    console.error('Error fetching community events:', error)
    toast.add({ title: 'Error', description: 'Failed to load community events', color: 'error' })
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { 
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
  })
}

function isAttending(event: any) {
  if (!(session.value as any)?.user) return false
  return event.EventParticipant?.some((p: any) => p.userId === (session.value as any)?.user?.id)
}

async function toggleAttendance(event: any) {
  const currentlyAttending = isAttending(event)
  toggling.value = event.id
  
  try {
    await $fetch(`/api/community/events/${event.id}/attend`, {
      method: 'POST',
      body: { attending: !currentlyAttending }
    })
    
    // Optimistic update
    if (currentlyAttending) {
      event.EventParticipant = event.EventParticipant.filter((p: any) => p.userId !== (session.value as any)?.user?.id)
    } else {
      event.EventParticipant.push({ userId: (session.value as any)?.user?.id })
    }
    
    toast.add({
      title: !currentlyAttending ? 'RSVP Confirmed' : 'RSVP Cancelled',
      description: !currentlyAttending ? `You are attending ${event.title}` : `You are no longer attending ${event.title}`,
      color: 'success'
    })
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to update RSVP', color: 'error' })
  } finally {
    toggling.value = null
  }
}

function changeMonth(delta: number) {
  currentDate.value = new Date(currentYear.value, currentMonth.value + delta, 1)
}

function eventsOnDate(date: Date) {
  return events.value.filter(e => {
    const d = new Date(e.date)
    return d.getFullYear() === date.getFullYear() && 
           d.getMonth() === date.getMonth() && 
           d.getDate() === date.getDate()
  })
}

const calendarCells = computed(() => {
  const cells = []
  const year = currentYear.value
  const month = currentMonth.value
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  const firstDayWeekday = firstDayOfMonth.getDay()
  
  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      day: prevMonthLastDay - i,
      currentMonth: false,
      isToday: false
    })
  }
  
  // Current month
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
  
  // Next month padding
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
