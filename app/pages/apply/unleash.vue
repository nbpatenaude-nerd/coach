<template>
  <div class="min-h-screen bg-slate-950 py-24 px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-4xl font-bold text-white mb-4">Apply for UNLEASH</h1>
      <p class="text-slate-400 mb-8">
        This tier is for athletes pushing the absolute limits. Please provide detailed insights into
        your physiological and psychological goals.
      </p>

      <form class="space-y-6" @submit.prevent="submitForm">
        <UFormGroup label="Name" name="name" required>
          <UInput v-model="form.name" placeholder="Your full name" />
        </UFormGroup>

        <UFormGroup label="Email" name="email" required>
          <UInput v-model="form.email" type="email" placeholder="Your email address" />
        </UFormGroup>

        <UFormGroup label="Physiological & Psychological Goals" name="goals" required>
          <UTextarea
            v-model="form.goals"
            placeholder="How do you want to shape your identity as an athlete?"
            :rows="4"
          />
        </UFormGroup>

        <UFormGroup label="Race Limiters & Strengths" name="limiters" required>
          <UTextarea
            v-model="form.limiters"
            placeholder="What holds you back? What are you best at?"
            :rows="3"
          />
        </UFormGroup>

        <UFormGroup label="Nutritional Approach" name="nutrition">
          <UTextarea
            v-model="form.nutrition"
            placeholder="Describe your current fueling strategy."
            :rows="2"
          />
        </UFormGroup>

        <UButton type="submit" color="primary" class="w-full justify-center" :loading="loading">
          Submit Elite Application
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
    limiters: '',
    nutrition: ''
  })

  const submitForm = async () => {
    loading.value = true
    try {
      await $fetch('/api/apply/submit', {
        method: 'POST',
        body: { ...form.value, tier: 'UNLEASH' }
      })
      toast.add({
        title: 'Application Submitted',
        description: 'We will review your elite profile and reach out.',
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
