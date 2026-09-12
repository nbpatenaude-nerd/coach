<template>
  <div class="min-h-screen bg-slate-950 py-24 px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-4xl font-bold text-white mb-4">Apply for UNLOCK</h1>
      <p class="text-slate-400 mb-8">
        Please fill out this general intake form. We will review your application and get back to
        you shortly.
      </p>

      <form class="space-y-6" @submit.prevent="submitForm">
        <UFormGroup label="Name" name="name" required>
          <UInput v-model="form.name" placeholder="Your full name" />
        </UFormGroup>

        <UFormGroup label="Email" name="email" required>
          <UInput v-model="form.email" type="email" placeholder="Your email address" />
        </UFormGroup>

        <UFormGroup label="Goal Events" name="goals">
          <UTextarea
            v-model="form.goals"
            placeholder="What are your goal events for this season?"
          />
        </UFormGroup>

        <UFormGroup label="Current Experience Level" name="experience">
          <URadioGroup
            v-model="form.experience"
            :options="['Beginner', 'Intermediate', 'Advanced', 'Elite']"
          />
        </UFormGroup>

        <UFormGroup label="Commitment Level (1-10)" name="commitment">
          <URange v-model="form.commitment" :min="1" :max="10" />
        </UFormGroup>

        <UButton type="submit" color="primary" class="w-full justify-center" :loading="loading">
          Submit Application
        </UButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
  const toast = useToast()
  const loading = ref(false)
  const form = ref({
    name: '',
    email: '',
    goals: '',
    experience: 'Intermediate',
    commitment: 7
  })

  const submitForm = async () => {
    loading.value = true
    try {
      await $fetch('/api/apply/submit', { method: 'POST', body: { ...form.value, tier: 'UNLOCK' } })
      toast.add({
        title: 'Application Submitted',
        description: 'We will be in touch soon!',
        color: 'success'
      })
      navigateTo('/')
    } catch (err) {
      toast.add({ title: 'Error', description: 'Failed to submit application.', color: 'error' })
    } finally {
      loading.value = false
    }
  }
</script>
