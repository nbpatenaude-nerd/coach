<script setup lang="ts">
  import { useRoute, useRouter } from '#app'
  import { ref } from 'vue'

  const route = useRoute()
  const router = useRouter()
  const programId = route.params.id as string

  const { data: program, error } = await useFetch(`/api/programs/${programId}`)

  const isSubscribing = ref(false)
  const hasSubscribed = ref(false)

  async function subscribe() {
    isSubscribing.value = true
    try {
      await $fetch(`/api/coaching/programs/${programId}/subscribe`, { method: 'POST' })
      hasSubscribed.value = true
      useToast().add({
        title: 'Subscribed!',
        description: 'Workouts will now appear on your calendar.',
        color: 'green'
      })
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: any) {
      useToast().add({
        title: 'Error',
        description: err.data?.message || 'Failed to subscribe',
        color: 'red'
      })
    } finally {
      isSubscribing.value = false
    }
  }
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div v-if="error" class="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
        <Icon name="lucide:alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 class="text-xl font-bold text-foreground">Program Not Found</h2>
        <p class="text-muted-foreground mt-2">This program link may be invalid or expired.</p>
        <UButton class="mt-6" block variant="outline" to="/dashboard">Return Home</UButton>
      </div>

      <div
        v-else-if="program"
        class="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center border border-border"
      >
        <UAvatar :src="program.image" :alt="program.name" size="3xl" class="mx-auto mb-4" />
        <h2 class="mt-2 text-3xl font-extrabold text-foreground">{{ program.name }}</h2>
        <p class="mt-2 text-sm text-muted-foreground">
          Join {{ program.subscriberCount }} other athletes in this training program.
        </p>

        <div class="mt-8 space-y-4">
          <p class="text-foreground text-sm">
            By subscribing, the program's workouts will automatically sync to your personal
            calendar. You maintain full control over your daily execution and check-ins.
          </p>

          <UButton
            v-if="!hasSubscribed"
            block
            size="xl"
            color="primary"
            :loading="isSubscribing"
            @click="subscribe"
          >
            Subscribe to Program
          </UButton>

          <UButton v-else block size="xl" color="green" icon="i-lucide-check" disabled>
            Subscribed Successfully!
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
