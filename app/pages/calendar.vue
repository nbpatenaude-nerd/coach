<template>
  <UDashboardPage>
    <UDashboardPanel id="calendar" grow>
      <template #header>
        <UDashboardNavbar title="Community Calendar">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <div class="p-0 sm:p-6 space-y-4 sm:space-y-6">
          <!-- Page Header -->
          <div class="px-4 sm:px-0">
            <h1 class="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              Town Hall
            </h1>
            <p
              class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mt-1 italic"
            >
              See who is racing what and RSVP to join the crew.
            </p>
          </div>

          <div v-if="pending" class="flex justify-center items-center h-64">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-primary-500 animate-spin" />
          </div>

          <div v-else-if="error" class="flex flex-col justify-center items-center h-64 text-center">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-500 mb-4" />
            <h3 class="text-xl font-bold text-white mb-2">Error loading events</h3>
            <p class="text-gray-400">{{ error.message }}</p>
            <UButton class="mt-4" @click="() => refresh()">Retry</UButton>
          </div>

          <div
            v-else-if="events.length === 0"
            class="flex flex-col justify-center items-center h-64 text-center bg-gray-900/50 rounded-xl border border-white/5 p-8"
          >
            <UIcon name="i-heroicons-calendar" class="w-12 h-12 text-gray-500 mb-4" />
            <h3 class="text-xl font-bold text-white mb-2">No Upcoming Events</h3>
            <p class="text-gray-400">Check back later for new community races and socials.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <UCard
              v-for="event in events"
              :key="event.id"
              class="flex flex-col bg-gray-900 border-white/10 hover:border-primary-500/50 transition-colors cursor-pointer"
              @click="openDetailsModal(event)"
            >
              <div class="flex justify-between items-start mb-4">
                <UBadge
                  :color="getTypeColor(event.type)"
                  variant="subtle"
                  size="sm"
                  class="uppercase tracking-widest font-bold text-[10px]"
                >
                  {{ event.type || 'Event' }}
                </UBadge>
                <div class="text-right">
                  <div class="text-lg font-bold text-white">{{ formatDate(event.date) }}</div>
                  <div class="text-xs text-gray-500">
                    {{ formatDistanceToNow(new Date(event.date), { addSuffix: true }) }}
                  </div>
                </div>
              </div>

              <h3 class="text-xl font-bold text-white mb-2 font-athletic uppercase leading-tight">
                {{ event.title }}
              </h3>

              <div class="flex items-center gap-2 text-gray-400 text-sm mb-4">
                <UIcon name="i-heroicons-map-pin" class="w-4 h-4 shrink-0" />
                <span class="truncate">{{ event.location || 'TBD' }}</span>
              </div>

              <p class="text-sm text-gray-400 mb-6 line-clamp-2 min-h-10">
                {{ event.description }}
              </p>

              <div class="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <UAvatarGroup
                    v-if="event.participants && event.participants.length > 0"
                    size="sm"
                    :max="3"
                  >
                    <UTooltip
                      v-for="p in event.participants"
                      :key="p.id"
                      :text="p.name || 'Athlete'"
                    >
                      <UAvatar
                        :src="p.image || undefined"
                        :alt="p.name || 'Athlete'"
                        :text="p.name ? p.name.charAt(0).toUpperCase() : 'A'"
                        class="ring-gray-900 cursor-pointer"
                      />
                    </UTooltip>
                  </UAvatarGroup>
                  <div class="text-xs font-medium text-gray-400">
                    <span v-if="event.participants && event.participants.length > 0">
                      <strong class="text-white">{{ event.participants.length }}</strong> Racing
                    </span>
                    <span v-else>Be the first</span>
                  </div>
                </div>

                <UButton
                  :color="isParticipating(event) ? 'success' : 'primary'"
                  :variant="isParticipating(event) ? 'subtle' : 'solid'"
                  :icon="isParticipating(event) ? 'i-heroicons-check' : 'i-heroicons-plus'"
                  size="sm"
                  :loading="loadingEventId === event.id"
                  @click.stop="openRSVPModal(event)"
                >
                  {{ isParticipating(event) ? "You're Racing!" : "I'm Racing This!" }}
                </UButton>
              </div>
            </UCard>
          </div>
        </div>

        <!-- RSVP Priority Modal -->
        <UModal v-model:open="isRSVPModalOpen" title="Select Priority">
          <template #body>
            <div class="space-y-4">
              <p class="text-sm text-gray-400">
                How important is this event to your overall training goals? This helps personalize
                your training plan.
              </p>
              <USelect
                v-model="selectedPriority"
                :items="[
                  { label: 'A - Peak Race (Highest Priority)', value: 'A' },
                  { label: 'B - Important but not peaked', value: 'B' },
                  { label: 'C - Fun/Training race', value: 'C' }
                ]"
                placeholder="Select priority"
              />
              <div class="flex justify-end gap-2 mt-4">
                <UButton
                  color="neutral"
                  variant="ghost"
                  @click="
                    () => {
                      isRSVPModalOpen = false
                    }
                  "
                  >Cancel</UButton
                >
                <UButton
                  color="primary"
                  variant="solid"
                  :loading="loadingEventId === selectedEventForRSVP?.id"
                  :disabled="!selectedPriority"
                  @click="confirmRSVP"
                >
                  Confirm RSVP
                </UButton>
              </div>
            </div>
          </template>
        </UModal>

        <EventsEventDetailsModal
          v-model="isDetailsModalOpen"
          :event="selectedEventDetails"
          :is-participating="isParticipating(selectedEventDetails)"
        />
      </template>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { format, formatDistanceToNow } from 'date-fns'

  definePageMeta({
    middleware: 'auth',
    layout: 'app'
  })

  const { data: session } = useAuth()
  const {
    data: events,
    pending,
    error,
    refresh
  } = useFetch<any[]>('/api/events/community' as any, {
    default: () => []
  })

  const loadingEventId = ref<string | null>(null)
  const isRSVPModalOpen = ref(false)
  const isDetailsModalOpen = ref(false)
  const selectedEventForRSVP = ref<any>(null)
  const selectedEventDetails = ref<any>(null)
  const selectedPriority = ref('B')
  const toast = useToast()

  const openDetailsModal = (event: any) => {
    selectedEventDetails.value = event
    isDetailsModalOpen.value = true
  }

  const isParticipating = (event: any) => {
    if (!session.value?.user?.id || !event.participants) return false
    return event.participants.some((p: any) => p.id === session.value?.user?.id)
  }

  const openRSVPModal = (event: any) => {
    if (isParticipating(event)) {
      // If already participating, just toggle (remove) immediately
      toggleRSVP(event.id)
    } else {
      selectedEventForRSVP.value = event
      selectedPriority.value = 'B'
      isRSVPModalOpen.value = true
    }
  }

  const confirmRSVP = () => {
    if (selectedEventForRSVP.value) {
      toggleRSVP(selectedEventForRSVP.value.id, selectedPriority.value)
      isRSVPModalOpen.value = false
    }
  }

  const toggleRSVP = async (eventId: string, priority?: string) => {
    loadingEventId.value = eventId
    try {
      await $fetch('/api/events/rsvp' as any, {
        method: 'POST',
        body: { eventId, priority }
      })

      // Refresh the local data to reflect new RSVP status
      await refresh()

      toast.add({
        title: 'RSVP Updated',
        icon: 'i-heroicons-check-circle',
        color: 'success'
      })
    } catch (e: any) {
      toast.add({
        title: 'Failed to update RSVP',
        description: e.message || 'Please try again.',
        icon: 'i-heroicons-exclamation-triangle',
        color: 'error'
      })
    } finally {
      loadingEventId.value = null
    }
  }

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM do, yyyy')
  }

  const getTypeColor = (type: string | null) => {
    if (!type) return 'neutral'
    const t = type.toLowerCase()
    if (t.includes('triathlon')) return 'info'
    if (t.includes('run')) return 'warning'
    if (t.includes('cycl') || t.includes('bike')) return 'info'
    if (t.includes('social')) return 'secondary'
    if (t.includes('swim')) return 'info'
    return 'primary'
  }
</script>
