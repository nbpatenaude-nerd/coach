<template>
  <USlideover :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <div class="flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <!-- Header -->
      <div
        class="px-4 py-4 sm:px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shrink-0"
      >
        <div>
          <h2
            class="text-xl font-bold text-gray-900 dark:text-white uppercase font-athletic tracking-tight"
          >
            {{ event?.title || 'Event Chat' }}
          </h2>
          <p v-if="event?.date" class="text-sm text-gray-500 dark:text-gray-400">
            {{ formatDate(event.date) }}
          </p>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark-20-solid"
          class="-my-1"
          @click="$emit('update:modelValue', false)"
        />
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
        <div v-if="pendingMessages" class="flex justify-center p-4">
          <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-primary animate-spin" />
        </div>
        <div v-else-if="messagesError" class="text-center text-red-500 p-4">
          Failed to load messages
        </div>
        <div
          v-else-if="messages.length === 0"
          class="text-center text-gray-500 dark:text-gray-400 p-8"
        >
          No messages yet. Be the first to start the conversation!
        </div>
        <div v-else class="space-y-6 flex flex-col-reverse">
          <div v-for="msg in messages" :key="msg.id" class="flex gap-3">
            <UAvatar
              :src="msg.user?.image || undefined"
              :alt="msg.user?.name || 'User'"
              size="sm"
              class="shrink-0 mt-1"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-2 mb-1">
                <span class="font-bold text-sm text-gray-900 dark:text-white">{{
                  msg.user?.name || 'Athlete'
                }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{
                  formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })
                }}</span>
              </div>
              <div class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {{ msg.content }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div
        class="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0"
      >
        <div v-if="!isParticipating" class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
            You must be racing this event to join the chat.
          </p>
        </div>
        <form v-else class="flex gap-2" @submit.prevent="sendMessage">
          <UTextarea
            v-model="newMessage"
            placeholder="Write a message..."
            autoresize
            :rows="1"
            :maxrows="4"
            class="flex-1"
            @keydown.enter.prevent="sendMessage"
          />
          <UButton
            type="submit"
            color="primary"
            icon="i-heroicons-paper-airplane"
            :disabled="!newMessage.trim() || sending"
            :loading="sending"
            class="self-end"
          />
        </form>
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { format, formatDistanceToNow } from 'date-fns'

  const props = defineProps<{
    modelValue: boolean
    event: any
    isParticipating: boolean
  }>()

  const emit = defineEmits(['update:modelValue'])

  const toast = useToast()
  const newMessage = ref('')
  const sending = ref(false)

  const {
    data: messagesData,
    pending: pendingMessages,
    error: messagesError,
    refresh: refreshMessages
  } = useFetch<any[]>(() => `/api/events/${props.event?.id}/messages`, {
    immediate: false,
    default: () => []
  })

  const messages = computed(() => messagesData.value || [])

  watch(
    () => props.modelValue,
    (isOpen) => {
      if (isOpen && props.event?.id) {
        refreshMessages()
      }
    }
  )

  const sendMessage = async () => {
    if (!newMessage.value.trim() || !props.event?.id || sending.value) return

    sending.value = true
    try {
      const msg = await $fetch(`/api/events/${props.event.id}/messages`, {
        method: 'POST',
        body: { content: newMessage.value.trim() }
      })

      // Add locally to avoid waiting for refresh
      if (messagesData.value) {
        messagesData.value.unshift(msg)
      }
      newMessage.value = ''
    } catch (error: any) {
      toast.add({
        title: 'Error sending message',
        description: error.message,
        color: 'error'
      })
    } finally {
      sending.value = false
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return format(new Date(dateStr), 'MMMM do, yyyy')
  }
</script>
