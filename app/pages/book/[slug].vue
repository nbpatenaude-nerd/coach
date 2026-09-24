<template>
  <div class="min-h-screen bg-[#020617] text-white font-sans">
    <!-- Header -->
    <header
      class="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/5"
    >
      <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/"
          ><img src="/media/logo.webp" alt="Journey Endurance" class="h-8 w-auto"
        /></NuxtLink>
        <span class="text-xs font-bold uppercase tracking-widest text-slate-500">Scheduling</span>
      </div>
    </header>
    <div class="pt-24 pb-24 px-6">
      <div class="max-w-4xl mx-auto">
        <div v-if="pending" class="flex items-center justify-center py-32">
          <div
            class="animate-spin w-8 h-8 border-2 border-slate-700 border-t-cyan-400 rounded-full"
          ></div>
        </div>
        <div v-else-if="fetchError || !meetingType" class="text-center py-32">
          <p class="text-slate-400 text-xl">This booking link was not found.</p>
          <NuxtLink to="/" class="mt-6 inline-block text-cyan-400 hover:text-cyan-300"
            >Back to Home</NuxtLink
          >
        </div>
        <div v-else-if="confirmed" class="text-center py-16">
          <div
            class="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-8"
          >
            <UIcon name="i-heroicons-check" class="w-8 h-8 text-green-400" />
          </div>
          <h1 class="text-4xl font-bold text-white mb-4">You're Booked!</h1>
          <p class="text-slate-400 text-lg">{{ meetingType.name }} with Coach Nick</p>
          <p class="text-2xl font-bold text-cyan-400 mt-6">{{ confirmedLabel }}</p>
          <p class="text-slate-500 mt-2 text-sm">Confirmation sent to {{ form.prospectEmail }}</p>
          <NuxtLink
            to="/"
            class="mt-10 inline-block text-slate-400 hover:text-white text-sm uppercase tracking-widest"
            >Back to Journey Endurance</NuxtLink
          >
        </div>
        <template v-else>
          <div class="mb-12">
            <p class="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">
              Journey Endurance Coaching
            </p>
            <h1 class="text-4xl font-bold text-white tracking-wide">{{ meetingType.name }}</h1>
            <p class="text-slate-400 mt-2">
              {{ meetingType.durationMins }} minutes &middot; Video Call
            </p>
            <p v-if="meetingType.description" class="text-slate-500 mt-1 text-sm">
              {{ meetingType.description }}
            </p>
          </div>
          <div class="flex flex-col lg:flex-row gap-0">
            <!-- Steps sidebar -->
            <div class="lg:w-48 shrink-0 mb-8 lg:mb-0">
              <div class="flex lg:flex-col gap-1">
                <button
                  v-for="(step, i) in steps"
                  :key="step.id"
                  class="flex items-center gap-3 p-3 rounded-none transition-all text-left w-full"
                  :disabled="currentStep < i"
                  @click="currentStep > i && (currentStep = i)"
                >
                  <span
                    class="font-athletic text-lg tracking-widest w-6 shrink-0"
                    :class="
                      currentStep > i
                        ? 'text-cyan-400'
                        : currentStep === i
                          ? 'text-white'
                          : 'text-slate-700'
                    "
                    >{{ i + 1 }}</span
                  >
                  <span
                    class="text-xs font-bold uppercase tracking-widest"
                    :class="currentStep >= i ? 'text-white' : 'text-slate-600'"
                    >{{ step.label }}</span
                  >
                </button>
              </div>
            </div>
            <!-- Step content -->
            <div class="flex-1 lg:pl-12 lg:border-l lg:border-white/5">
              <!-- Step 0: Date -->
              <div v-if="currentStep === 0" class="space-y-6">
                <h2
                  class="text-2xl font-bold uppercase tracking-widest border-b border-white/10 pb-4"
                >
                  Select a Date
                </h2>
                <div
                  class="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-widest text-slate-600 mb-1"
                >
                  <div v-for="d in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="d">
                    {{ d }}
                  </div>
                </div>
                <div class="grid grid-cols-7 gap-1">
                  <template v-for="(cell, ci) in calendarCells" :key="ci">
                    <button
                      v-if="cell"
                      class="h-10 w-full text-sm font-medium transition-all"
                      :class="[
                        cell.dateStr === selectedDate
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : cell.hasSlots
                            ? 'hover:bg-slate-800 text-white cursor-pointer'
                            : 'text-slate-700 cursor-default',
                        cell.isPast ? 'opacity-30 pointer-events-none' : ''
                      ]"
                      :disabled="!cell.hasSlots || cell.isPast"
                      @click="selectDate(cell.dateStr)"
                    >
                      {{ cell.day }}
                    </button>
                    <div v-else></div>
                  </template>
                </div>
              </div>
              <!-- Step 1: Time -->
              <div v-if="currentStep === 1" class="space-y-6">
                <h2
                  class="text-2xl font-bold uppercase tracking-widest border-b border-white/10 pb-4"
                >
                  Select a Time<span
                    class="text-slate-500 font-normal ml-2 text-base normal-case tracking-normal"
                    >{{ selectedDateLabel }}</span
                  >
                </h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    v-for="slot in slotsForDate"
                    :key="slot.start"
                    class="border py-3 px-4 text-sm font-bold tracking-widest uppercase transition-all"
                    :class="
                      selectedSlot?.start === slot.start
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                        : 'border-slate-800 hover:border-slate-600 text-slate-300'
                    "
                    @click="selectSlot(slot)"
                  >
                    {{ fmt(slot.start) }}
                  </button>
                </div>
              </div>
              <!-- Step 2: Details -->
              <div v-if="currentStep === 2" class="space-y-10">
                <h2
                  class="text-2xl font-bold uppercase tracking-widest border-b border-white/10 pb-4"
                >
                  Your Details
                </h2>
                <div
                  v-if="selectedSlot"
                  class="bg-slate-900/50 border border-cyan-500/20 p-4 flex items-center gap-4"
                >
                  <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <p class="text-white font-bold">{{ selectedDateLabel }}</p>
                    <p class="text-slate-400 text-sm">
                      {{ fmt(selectedSlot.start) }} &middot; {{ meetingType.durationMins }} min
                    </p>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                      >Full Name *</label
                    ><input
                      v-model="form.prospectName"
                      required
                      type="text"
                      placeholder="Jane Smith"
                      class="w-full bg-transparent border-0 border-b border-slate-700 px-0 py-2 text-lg font-light text-white placeholder-slate-600 focus:ring-0 focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                      >Email *</label
                    ><input
                      v-model="form.prospectEmail"
                      required
                      type="email"
                      placeholder="jane@example.com"
                      class="w-full bg-transparent border-0 border-b border-slate-700 px-0 py-2 text-lg font-light text-white placeholder-slate-600 focus:ring-0 focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                    >Phone</label
                  ><input
                    v-model="form.prospectPhone"
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    class="w-full bg-transparent border-0 border-b border-slate-700 px-0 py-2 text-lg font-light text-white placeholder-slate-600 focus:ring-0 focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                    >Anything you'd like us to know?</label
                  ><textarea
                    v-model="form.prospectNotes"
                    rows="2"
                    placeholder="Goals, questions..."
                    class="w-full bg-transparent border-0 border-b border-slate-700 px-0 py-2 text-lg font-light text-white placeholder-slate-600 focus:ring-0 focus:border-cyan-400 transition-colors resize-none"
                  ></textarea>
                </div>
              </div>
              <!-- Navigation -->
              <div class="mt-12 flex items-center justify-between">
                <button
                  v-if="currentStep > 0"
                  class="text-slate-400 hover:text-white text-sm uppercase tracking-widest"
                  @click="currentStep--"
                >
                  ← Back
                </button>
                <div v-else></div>
                <button
                  v-if="currentStep < 2"
                  :disabled="!canNext"
                  class="group flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 py-3 px-8 font-bold text-slate-950 transition-all hover:scale-[1.02] disabled:opacity-40"
                  @click="next"
                >
                  <span class="uppercase tracking-widest text-sm">Next</span
                  ><span class="group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  v-if="currentStep === 2"
                  :disabled="submitting || !form.prospectName || !form.prospectEmail"
                  class="group flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 py-3 px-8 font-bold text-slate-950 transition-all hover:scale-[1.02] disabled:opacity-40"
                  @click="submit"
                >
                  <span class="uppercase tracking-widest text-sm">{{
                    submitting ? 'Confirming...' : 'Confirm Booking'
                  }}</span
                  ><span class="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({ layout: false, auth: false })
  const route = useRoute()
  const slug = computed(() => route.params.slug as string)
  const toast = useToast()
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const {
    data,
    pending,
    error: fetchError
  } = await useFetch(() => `/api/booking/${slug.value}/slots`, {
    query: { days: 21, timezone: tz }
  })
  const meetingType = computed(() => (data.value as any)?.meetingType ?? null)
  const slots = computed(
    (): Record<string, { start: string; end: string }[]> => (data.value as any)?.slots ?? {}
  )
  const currentStep = ref(0)
  const selectedDate = ref<string | null>(null)
  const selectedSlot = ref<{ start: string; end: string } | null>(null)
  const confirmed = ref(false)
  const confirmedLabel = ref('')
  const submitting = ref(false)
  const form = ref({ prospectName: '', prospectEmail: '', prospectPhone: '', prospectNotes: '' })
  const steps = [
    { id: 'date', label: 'Date' },
    { id: 'time', label: 'Time' },
    { id: 'details', label: 'Details' }
  ]
  const today = new Date()
  const calendarCells = computed(() => {
    const y = today.getFullYear(),
      m = today.getMonth()
    const firstDay = new Date(y, m, 1).getDay()
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const cells: any[] = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({
        day: d,
        dateStr: ds,
        hasSlots: Boolean(slots.value[ds]?.length),
        isPast: new Date(ds) < new Date(new Date().toDateString())
      })
    }
    return cells
  })
  const slotsForDate = computed(() =>
    selectedDate.value ? (slots.value[selectedDate.value] ?? []) : []
  )
  const selectedDateLabel = computed(() =>
    selectedDate.value
      ? new Date(selectedDate.value + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        })
      : ''
  )
  const canNext = computed(() =>
    currentStep.value === 0
      ? Boolean(selectedDate.value)
      : currentStep.value === 1
        ? Boolean(selectedSlot.value)
        : true
  )
  const selectDate = (d: string) => {
    selectedDate.value = d
    selectedSlot.value = null
  }
  const selectSlot = (s: { start: string; end: string }) => {
    selectedSlot.value = s
  }
  const next = () => {
    if (canNext.value) currentStep.value++
  }
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz })
  const submit = async () => {
    if (!selectedSlot.value || !form.value.prospectName || !form.value.prospectEmail) return
    submitting.value = true
    try {
      await $fetch(`/api/booking/${slug.value}/confirm`, {
        method: 'POST',
        body: {
          slotStart: selectedSlot.value.start,
          slotEnd: selectedSlot.value.end,
          ...form.value,
          timezone: tz
        }
      })
      confirmedLabel.value = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      }).format(new Date(selectedSlot.value.start))
      confirmed.value = true
    } catch (e: any) {
      toast.add({
        title: 'Slot Unavailable',
        description: e?.data?.message ?? 'Please choose a different time.',
        color: 'red'
      })
    } finally {
      submitting.value = false
    }
  }
</script>
