<template>
  <div class="space-y-8 p-8 max-w-5xl mx-auto">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Booking System</h1>
        <p class="text-slate-400 mt-1 text-sm">
          Manage your calendar connections, availability, and meeting types.
        </p>
      </div>
      <a
        :href="publicUrl"
        target="_blank"
        class="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-bold uppercase tracking-widest transition-colors"
      >
        <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4" />
        View Booking Page
      </a>
    </div>

    <UTabs :items="tabs" class="w-full">
      <template #calendars>
        <div class="mt-6 space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-white">Connected Calendars</h2>
              <p class="text-slate-400 text-sm mt-1">
                Connect multiple Google accounts to block out your availability automatically.
              </p>
            </div>
            <a
              href="/api/admin/booking/calendars/connect"
              class="group flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 py-2 px-5 text-sm font-bold text-slate-950 transition-all hover:scale-[1.02]"
            >
              <UIcon name="i-heroicons-plus" class="w-4 h-4" />
              Connect Calendar
            </a>
          </div>
          <div v-if="calendarsLoading" class="py-8 text-center text-slate-500">Loading...</div>
          <div
            v-else-if="calendars.length === 0"
            class="py-12 text-center border border-dashed border-slate-800"
          >
            <UIcon name="i-heroicons-calendar" class="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p class="text-slate-400">No calendars connected yet.</p>
            <p class="text-slate-500 text-sm mt-1">
              Connect your Google accounts to enable unified availability.
            </p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="cal in calendars"
              :key="cal.id"
              class="flex items-center justify-between bg-slate-900/60 border border-white/5 p-4"
            >
              <div class="flex items-center gap-4">
                <div class="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p class="text-white font-medium">{{ cal.googleEmail }}</p>
                  <p class="text-slate-500 text-xs">
                    {{ cal.accountLabel ?? 'Google Calendar' }} &middot; Connected
                    {{ formatDate(cal.createdAt) }}
                  </p>
                </div>
              </div>
              <button
                class="text-slate-500 hover:text-red-400 transition-colors text-xs uppercase tracking-widest font-bold"
                @click="disconnectCalendar(cal.id)"
              >
                Disconnect
              </button>
            </div>
          </div>
          <div
            v-if="connectedBanner"
            class="flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 p-4 text-sm"
          >
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 shrink-0" />
            Calendar connected successfully! Free/busy data is now synced.
          </div>
        </div>
      </template>

      <template #availability>
        <div class="mt-6 space-y-6">
          <div>
            <h2 class="text-lg font-bold text-white">Weekly Availability</h2>
            <p class="text-slate-400 text-sm mt-1">
              Set the days and hours when prospects can book calls.
            </p>
          </div>
          <div class="space-y-3">
            <div
              v-for="(day, i) in weekDays"
              :key="i"
              class="flex items-center gap-6 bg-slate-900/40 border border-white/5 p-4"
            >
              <div class="w-28 shrink-0">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="rules[i]?.isActive"
                    class="appearance-none w-4 h-4 rounded border border-slate-600 checked:bg-cyan-500 checked:border-cyan-500 cursor-pointer"
                    @change="toggleDay(i)"
                  />
                  <span
                    class="text-sm font-bold uppercase tracking-widest"
                    :class="rules[i]?.isActive ? 'text-white' : 'text-slate-600'"
                    >{{ day }}</span
                  >
                </label>
              </div>
              <template v-if="rules[i]?.isActive">
                <input
                  v-model="rules[i].startTime"
                  type="time"
                  class="bg-transparent border-b border-slate-700 text-white text-sm px-0 py-1 focus:border-cyan-400 focus:outline-none"
                  @change="saveRule(i)"
                />
                <span class="text-slate-600">to</span>
                <input
                  v-model="rules[i].endTime"
                  type="time"
                  class="bg-transparent border-b border-slate-700 text-white text-sm px-0 py-1 focus:border-cyan-400 focus:outline-none"
                  @change="saveRule(i)"
                />
              </template>
              <span v-else class="text-slate-600 text-sm italic">Unavailable</span>
            </div>
          </div>
        </div>
      </template>

      <template #meeting-types>
        <div class="mt-6 space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-white">Meeting Types</h2>
              <p class="text-slate-400 text-sm mt-1">
                Define the types of calls prospects can book.
              </p>
            </div>
            <button
              class="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 py-2 px-5 text-sm font-bold text-slate-950 hover:scale-[1.02] transition-all"
              @click="showNewMeetingForm = true"
            >
              <UIcon name="i-heroicons-plus" class="w-4 h-4" /> New Type
            </button>
          </div>

          <div
            v-if="showNewMeetingForm"
            class="border border-cyan-500/20 bg-slate-950/60 p-6 space-y-6"
          >
            <h3 class="text-white font-bold uppercase tracking-widest text-sm">New Meeting Type</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="flex flex-col gap-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                  >Name</label
                ><input
                  v-model="newMeeting.name"
                  type="text"
                  placeholder="Exploratory Call"
                  class="bg-transparent border-b border-slate-700 text-white py-2 focus:border-cyan-400 focus:outline-none text-lg font-light placeholder-slate-600"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                  >Slug (URL)</label
                ><input
                  v-model="newMeeting.slug"
                  type="text"
                  placeholder="exploratory-call"
                  class="bg-transparent border-b border-slate-700 text-white py-2 focus:border-cyan-400 focus:outline-none text-lg font-light placeholder-slate-600"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                  >Duration (minutes)</label
                ><input
                  v-model.number="newMeeting.durationMins"
                  type="number"
                  placeholder="20"
                  class="bg-transparent border-b border-slate-700 text-white py-2 focus:border-cyan-400 focus:outline-none text-lg font-light"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                  >Buffer After (minutes)</label
                ><input
                  v-model.number="newMeeting.bufferMins"
                  type="number"
                  placeholder="15"
                  class="bg-transparent border-b border-slate-700 text-white py-2 focus:border-cyan-400 focus:outline-none text-lg font-light"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                  >Min Advance Notice (hours)</label
                ><input
                  v-model.number="newMeeting.leadTimeHours"
                  type="number"
                  placeholder="24"
                  class="bg-transparent border-b border-slate-700 text-white py-2 focus:border-cyan-400 focus:outline-none text-lg font-light"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                  >Conference/Zoom URL</label
                ><input
                  v-model="newMeeting.conferenceUrl"
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  class="bg-transparent border-b border-slate-700 text-white py-2 focus:border-cyan-400 focus:outline-none text-lg font-light placeholder-slate-600"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2 md:col-span-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                >Description</label
              ><input
                v-model="newMeeting.description"
                type="text"
                placeholder="A brief intro call to explore working together"
                class="bg-transparent border-b border-slate-700 text-white py-2 focus:border-cyan-400 focus:outline-none text-lg font-light placeholder-slate-600"
              />
            </div>
            <div class="flex gap-4 mt-4">
              <button
                :disabled="!newMeeting.name || !newMeeting.slug"
                class="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 py-2 px-6 text-sm font-bold text-slate-950 hover:scale-[1.02] transition-all disabled:opacity-40"
                @click="createMeetingType"
              >
                Create
              </button>
              <button
                class="text-slate-400 hover:text-white text-sm uppercase tracking-widest"
                @click="showNewMeetingForm = false"
              >
                Cancel
              </button>
            </div>
          </div>

          <div
            v-for="mt in meetingTypes"
            :key="mt.id"
            class="flex items-center justify-between bg-slate-900/40 border border-white/5 p-5"
          >
            <div>
              <p class="text-white font-bold">{{ mt.name }}</p>
              <p class="text-slate-500 text-xs mt-1">
                {{ mt.durationMins }} min &middot; Buffer: {{ mt.bufferMins }}min &middot; Lead:
                {{ mt.leadTimeHours }}h
              </p>
              <a
                :href="/book/"
                target="_blank"
                class="text-cyan-400 text-xs hover:underline mt-1 inline-block"
                >/book/{{ mt.slug }}</a
              >
            </div>
            <div class="flex items-center gap-2">
              <button
                class="text-slate-500 hover:text-white text-xs uppercase tracking-widest font-bold transition-colors"
                @click="copyLink(mt.slug)"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </template>

      <template #bookings>
        <div class="mt-6 space-y-6">
          <h2 class="text-lg font-bold text-white">Upcoming Bookings</h2>
          <div v-if="bookingsLoading" class="py-8 text-center text-slate-500">Loading...</div>
          <div
            v-else-if="bookings.length === 0"
            class="py-12 text-center border border-dashed border-slate-800"
          >
            <p class="text-slate-400">No upcoming bookings.</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="b in bookings"
              :key="b.id"
              class="flex items-center justify-between bg-slate-900/40 border border-white/5 p-4"
            >
              <div>
                <p class="text-white font-bold">{{ b.prospectName }}</p>
                <p class="text-slate-400 text-sm">{{ b.prospectEmail }}</p>
                <p class="text-slate-500 text-xs mt-1">
                  {{ formatDateTime(b.startTime) }} &middot; {{ b.meetingType.name }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <span
                  class="px-2 py-0.5 text-xs font-bold uppercase tracking-widest"
                  :class="
                    b.status === 'CONFIRMED'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-slate-800 text-slate-400'
                  "
                  >{{ b.status }}</span
                >
                <button
                  class="text-slate-500 hover:text-red-400 text-xs uppercase tracking-widest font-bold transition-colors"
                  @click="cancelBooking(b.id)"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({ layout: 'admin' })
  useSeoMeta({ title: 'Booking System - Admin' })

  const route = useRoute()
  const toast = useToast()
  const connectedBanner = ref(route.query.connected === 'true')
  setTimeout(() => (connectedBanner.value = false), 6000)

  const publicUrl = computed(() => /book/aelooprrtxy - call)

  const tabs = [
    { label: 'Connected Calendars', slot: 'calendars' },
    { label: 'Availability', slot: 'availability' },
    { label: 'Meeting Types', slot: 'meeting-types' },
    { label: 'Upcoming Bookings', slot: 'bookings' }
  ]

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Calendars
  const calendarsLoading = ref(true)
  const calendars = ref<any[]>([])
  const loadCalendars = async () => {
    calendarsLoading.value = true
    const { accounts } = await $fetch<any>('/api/admin/booking/calendars.get')
    calendars.value = accounts
    calendarsLoading.value = false
  }
  const disconnectCalendar = async (id: string) => {
    await $fetch(`/api/admin/booking/calendars/${id}`, { method: 'DELETE' })
    await loadCalendars()
  }

  // Availability rules
  const rules = ref<Record<number, { isActive: boolean; startTime: string; endTime: string }>>({})
  const loadRules = async () => {
    const { rules: r } = await $fetch<any>('/api/admin/booking/availability')
    r.forEach((rule: any) => {
      rules.value[rule.dayOfWeek] = {
        isActive: rule.isActive,
        startTime: rule.startTime,
        endTime: rule.endTime
      }
    })
    // Fill missing days
    for (let i = 0; i < 7; i++) {
      if (!rules.value[i])
        rules.value[i] = { isActive: false, startTime: '09:00', endTime: '17:00' }
    }
  }
  const toggleDay = async (day: number, e: Event) => {
    const isActive = (e.target as HTMLInputElement).checked
    rules.value[day] = { ...rules.value[day], isActive }
    await saveRule(day)
  }
  const saveRule = async (day: number) => {
    const r = rules.value[day]
    await $fetch('/api/admin/booking/availability', {
      method: 'POST',
      body: { dayOfWeek: day, startTime: r.startTime, endTime: r.endTime, isActive: r.isActive }
    })
    toast.add({ title: 'Saved', color: 'green', timeout: 1500 })
  }

  // Meeting types
  const meetingTypes = ref<any[]>([])
  const showNewMeetingForm = ref(false)
  const newMeeting = ref({
    name: '',
    slug: '',
    description: '',
    durationMins: 20,
    bufferMins: 15,
    leadTimeHours: 24,
    conferenceUrl: ''
  })
  const loadMeetingTypes = async () => {
    const { meetingTypes: m } = await $fetch<any>('/api/admin/booking/meeting-types')
    meetingTypes.value = m
  }
  const createMeetingType = async () => {
    await $fetch('/api/admin/booking/meeting-types', { method: 'POST', body: newMeeting.value })
    await loadMeetingTypes()
    showNewMeetingForm.value = false
    newMeeting.value = {
      name: '',
      slug: '',
      description: '',
      durationMins: 20,
      bufferMins: 15,
      leadTimeHours: 24,
      conferenceUrl: ''
    }
    toast.add({ title: 'Meeting type created', color: 'green' })
  }
  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/book/${slug}`)
    toast.add({ title: 'Link copied!', color: 'green', timeout: 1500 })
  }

  // Bookings
  const bookingsLoading = ref(true)
  const bookings = ref<any[]>([])
  const loadBookings = async () => {
    bookingsLoading.value = true
    const { bookings: b } = await $fetch<any>(
      '/api/admin/booking/bookings?status=CONFIRMED&upcoming=true'
    )
    bookings.value = b
    bookingsLoading.value = false
  }
  const cancelBooking = async (id: string) => {
    await $fetch(`/api/admin/booking/bookings/${id}/cancel`, { method: 'POST' })
    await loadBookings()
    toast.add({ title: 'Booking cancelled', color: 'green' })
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })

  onMounted(async () => {
    await Promise.all([loadCalendars(), loadRules(), loadMeetingTypes(), loadBookings()])
  })
</script>
