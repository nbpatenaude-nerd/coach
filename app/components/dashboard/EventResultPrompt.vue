<template>
  <div v-if="pendingEvents.length > 0" class="mb-6 space-y-4">
    <UAlert
      v-for="event in pendingEvents"
      :key="event.id"
      icon="i-heroicons-trophy"
      color="primary"
      variant="subtle"
      :title="'How did ' + event.title + ' go?'"
      :description="
        'It looks like you had an event on ' +
        formatMonthDay(event.date) +
        '. Record your results and let the community know how you did!'
      "
      :actions="[{ label: 'Record Result', click: () => openResultModal(event) }]"
    />

    <EventsEventResultModal
      v-model="isResultModalOpen"
      :event="selectedEvent"
      @saved="onResultSaved"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  const { data: events, refresh } = useFetch<any[]>('/api/events')
  const { formatDate, getUserLocalDate } = useFormat()

  const pendingEvents = computed(() => {
    if (!events.value) return []
    const today = getUserLocalDate()
    return events.value.filter((e) => {
      // Only prompt for events that are today or in the past, and not completed
      const eventDate = new Date(e.date)
      return !e.isCompleted && eventDate <= today
    })
  })

  const isResultModalOpen = ref(false)
  const selectedEvent = ref<any>(null)

  const openResultModal = (event: any) => {
    selectedEvent.value = event
    isResultModalOpen.value = true
  }

  const onResultSaved = () => {
    refresh()
  }

  const formatMonthDay = (date: string) => {
    return formatDate(date, 'MMM d')
  }
</script>
