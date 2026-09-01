<template>
  <UModal v-model:open="isOpen" :ui="{ width: 'sm:max-w-3xl' }">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-white/10' }">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-2xl font-black text-white uppercase">{{ event?.title }}</h3>
            <p class="text-sm text-gray-400">
              {{ event?.date ? new Date(event.date).toLocaleDateString() : '' }} |
              {{ event?.location || 'TBD' }}
            </p>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="isOpen = false"
          />
        </div>
      </template>

      <div class="py-2">
        <p class="text-sm text-gray-300 mb-6">{{ event?.description }}</p>

        <h4 class="text-lg font-bold text-white mb-4 uppercase">Message Board</h4>

        <!-- Message List -->
        <div class="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
          <div v-if="pendingMessages" class="text-center py-4">
            <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-primary-500" />
          </div>
          <div
            v-else-if="messages.length === 0"
            class="text-center py-8 bg-white/5 rounded-lg border border-white/10"
          >
            <p class="text-sm text-gray-400">No messages yet. Be the first to post!</p>
          </div>
          <div
            v-for="msg in messages"
            v-else
            :key="msg.id"
            class="flex gap-3 bg-white/5 p-3 rounded-lg border border-white/10"
          >
            <UAvatar
              :src="msg.user.image || undefined"
              :alt="msg.user.name"
              :text="msg.user.name?.charAt(0)"
              size="sm"
            />
            <div class="flex-1">
              <div class="flex items-baseline justify-between">
                <span class="font-semibold text-white text-sm">{{ msg.user.name }}</span>
                <span class="text-xs text-gray-500">{{
                  new Date(msg.createdAt).toLocaleString()
                }}</span>
              </div>
              <p class="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{{ msg.content }}</p>
            </div>
          </div>
        </div>

        <!-- Post Input -->
        <div v-if="isParticipating" class="flex gap-2">
          <UTextarea
            v-model="newMessage"
            placeholder="Post a note about travel, pacing, or meetup..."
            class="flex-1"
            :rows="2"
            autoresize
          />
          <UButton
            color="primary"
            icon="i-heroicons-paper-airplane"
            :loading="posting"
            :disabled="!newMessage.trim()"
            class="self-end"
            @click="postMessage"
          >
            Post
          </UButton>
        </div>
        <div v-else class="text-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p class="text-sm text-yellow-500/80">RSVP to this event to join the conversation.</p>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'

  const props = defineProps<{
    modelValue: boolean
    event: any
    isParticipating: boolean
  }>()

  const emit = defineEmits(['update:modelValue'])

  const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const messages = ref<any[]>([])
  const pendingMessages = ref(false)
  const newMessage = ref('')
  const posting = ref(false)

  const fetchMessages = async () => {
    if (!props.event?.id) return
    pendingMessages.value = true
    try {
      messages.value = await $fetch(`/api/events/${props.event.id}/messages`)
    } catch (e) {
      console.error('Failed to fetch messages', e)
    } finally {
      pendingMessages.value = false
    }
  }

  watch(
    () => props.modelValue,
    (isOpen) => {
      if (isOpen && props.event) {
        fetchMessages()
      }
    }
  )

  const postMessage = async () => {
    if (!newMessage.value.trim() || !props.event?.id) return

    posting.value = true
    try {
      const msg = await $fetch(`/api/events/${props.event.id}/messages`, {
        method: 'POST',
        body: { content: newMessage.value.trim() }
      })
      // append immediately
      messages.value.unshift(msg)
      newMessage.value = ''
    } catch (e) {
      console.error('Failed to post message', e)
    } finally {
      posting.value = false
    }
  }
</script>
