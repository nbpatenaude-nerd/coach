<script setup lang="ts">
  definePageMeta({
    middleware: ['auth', 'coach'] as any
  })

  const route = useRoute()
  const programId = route.params.id as string
  const coachingStore = useCoachingStore()
  const toast = useToast()

  const {
    data: program,
    pending,
    error,
    refresh
  } = await useFetch(`/api/coaching/programs/${programId}`)

  const removingAthleteId = ref<string | null>(null)

  function getSubscribeLink() {
    const base = import.meta.client ? window.location.origin : ''
    return `${base}/programs/${programId}/subscribe`
  }

  function copySubscribeLink() {
    navigator.clipboard.writeText(getSubscribeLink())
    toast.add({ title: 'Link Copied', description: 'Share this with athletes to subscribe.' })
  }

  function manageCalendar() {
    if (!program.value) return
    coachingStore.startEditingProgram(program.value.id, program.value.name)
  }

  async function removeSubscriber(athleteId: string) {
    removingAthleteId.value = athleteId
    try {
      await $fetch(`/api/coaching/programs/${programId}/subscribers/${athleteId}`, {
        method: 'DELETE'
      })
      toast.add({ title: 'Subscriber removed' })
      await refresh()
    } catch (err: any) {
      toast.add({
        title: 'Failed to remove subscriber',
        description: err?.data?.message || 'Please try again.',
        color: 'red'
      })
    } finally {
      removingAthleteId.value = null
    }
  }
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">
    <!-- Back button -->
    <div>
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-lucide-arrow-left"
        to="/coaching/team-training"
        size="sm"
      >
        All Programs
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-8 w-64" />
      <USkeleton class="h-4 w-96" />
      <USkeleton class="h-32 w-full" />
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="bg-card border border-border rounded-xl p-12 text-center"
    >
      <UIcon name="i-lucide-alert-circle" class="w-10 h-10 mx-auto mb-3 text-red-400" />
      <p class="font-medium">Program not found</p>
      <p class="text-sm text-muted mt-1">This program may have been deleted.</p>
    </div>

    <template v-else-if="program">
      <!-- Header -->
      <div class="flex items-start gap-4">
        <UAvatar :src="program.image ?? undefined" :alt="program.name" size="xl" />
        <div class="flex-1">
          <h1 class="text-2xl font-bold">{{ program.name }}</h1>
          <p class="text-sm text-muted mt-1">
            {{ program.subscriberCount }}
            {{ program.subscriberCount === 1 ? 'subscriber' : 'subscribers' }}
          </p>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap gap-3">
        <UButton
          color="primary"
          icon="i-lucide-calendar"
          @click="manageCalendar"
        >
          Manage Program Calendar
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-link"
          @click="copySubscribeLink"
        >
          Copy Subscribe Link
        </UButton>
      </div>

      <!-- Info card -->
      <UCard>
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-info" class="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div class="text-sm text-muted space-y-1">
            <p>
              Click <strong class="text-foreground">Manage Program Calendar</strong> to open the
              program's calendar in edit mode. Any workouts you add, edit, or delete will
              automatically sync to all subscribed athletes.
            </p>
            <p>
              Share the subscribe link with athletes so they can join and receive workouts on their
              calendar.
            </p>
          </div>
        </div>
      </UCard>

      <!-- Subscribers -->
      <div>
        <h2 class="text-lg font-semibold mb-4">Subscribers</h2>

        <div
          v-if="!program.subscribers?.length"
          class="bg-card border border-border rounded-xl p-10 text-center"
        >
          <UIcon name="i-lucide-users" class="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p class="font-medium">No subscribers yet</p>
          <p class="text-sm text-muted mt-1">
            Share the subscribe link to get athletes enrolled.
          </p>
          <UButton
            class="mt-4"
            color="neutral"
            variant="outline"
            icon="i-lucide-link"
            @click="copySubscribeLink"
          >
            Copy Subscribe Link
          </UButton>
        </div>

        <div v-else class="divide-y divide-border border border-border rounded-xl overflow-hidden">
          <div
            v-for="subscriber in program.subscribers"
            :key="subscriber.id"
            class="flex items-center gap-4 px-4 py-3 bg-card hover:bg-muted/30 transition-colors"
          >
            <UAvatar
              :src="subscriber.image ?? undefined"
              :alt="subscriber.name ?? subscriber.email"
              size="sm"
            />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm truncate">{{ subscriber.name || subscriber.email }}</p>
              <p class="text-xs text-muted truncate">{{ subscriber.email }}</p>
            </div>
            <UButton
              color="red"
              variant="ghost"
              size="xs"
              :loading="removingAthleteId === subscriber.id"
              icon="i-lucide-user-minus"
              @click="removeSubscriber(subscriber.id)"
            >
              Remove
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>