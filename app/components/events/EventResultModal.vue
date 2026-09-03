<template>
  <UModal v-model:open="isOpen" :ui="{ width: 'sm:max-w-xl' }">
    <template #content>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-white/10' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-white">Add Result: {{ event?.title }}</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isOpen = false"
            />
          </div>
        </template>

        <form class="space-y-4 py-2" @submit.prevent="submitResult">
          <UFormGroup label="Result Time (hh:mm:ss or seconds)">
            <UInput v-model="form.timeInput" placeholder="e.g. 1:30:00 or 5400" />
          </UFormGroup>

          <UFormGroup label="Overall Position">
            <UInput v-model.number="form.resultPosition" type="number" placeholder="e.g. 15" />
          </UFormGroup>

          <UFormGroup label="Race Report">
            <UTextarea v-model="form.raceReport" placeholder="How did it go?" :rows="4" />
          </UFormGroup>

          <UFormGroup label="Photo URL">
            <UInput v-model="form.photoUrl" placeholder="https://imgur.com/..." />
          </UFormGroup>

          <div class="flex justify-end gap-3 mt-6">
            <UButton color="white" variant="ghost" @click="isOpen = false">Cancel</UButton>
            <UButton type="submit" color="primary" :loading="loading">Save Result</UButton>
          </div>
        </form>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'

  const props = defineProps<{ modelValue: boolean; event: any }>()
  const emit = defineEmits(['update:modelValue', 'saved'])
  const toast = useToast()

  const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const form = ref({
    timeInput: '',
    resultPosition: null as number | null,
    raceReport: '',
    photoUrl: ''
  })

  const { data: session } = useAuth()

  const loading = ref(false)

  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal && props.event?.participants && session.value?.user?.id) {
        const p = props.event.participants.find((p: any) => p.userId === session.value?.user?.id)
        if (p) {
          form.value = {
            timeInput: p.resultTime
              ? Math.floor(p.resultTime / 3600) +
                ':' +
                Math.floor((p.resultTime % 3600) / 60)
                  .toString()
                  .padStart(2, '0') +
                ':' +
                (p.resultTime % 60).toString().padStart(2, '0')
              : '',
            resultPosition: p.resultPosition || null,
            raceReport: p.raceReport || '',
            photoUrl: p.photoUrl || ''
          }
        }
      } else if (!newVal) {
        // Clear form when closing
        form.value = {
          timeInput: '',
          resultPosition: null,
          raceReport: '',
          photoUrl: ''
        }
      }
    }
  )

  const parseTime = (input: string) => {
    if (!input) return null
    if (!isNaN(Number(input))) return Number(input)
    const parts = input.split(':').map(Number)
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    return null
  }

  const submitResult = async () => {
    if (!props.event?.id) return
    loading.value = true
    try {
      await $fetch(`/api/events/${props.event.id}/results`, {
        method: 'POST',
        body: {
          resultTime: parseTime(form.value.timeInput),
          resultPosition: form.value.resultPosition,
          raceReport: form.value.raceReport,
          photoUrl: form.value.photoUrl
        }
      })
      toast.add({ title: 'Result saved!', color: 'success' })
      isOpen.value = false
      emit('saved')
    } catch (e: any) {
      toast.add({ title: 'Failed to save', description: e.message, color: 'error' })
    } finally {
      loading.value = false
    }
  }
</script>
