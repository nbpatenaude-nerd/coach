<template>
  <div
    class="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-x-clip bg-[oklch(12%_0.015_155)] px-4 py-10 sm:px-6 lg:py-16"
  >
    <UContainer class="relative z-10 w-full max-w-md">
      <div
        class="grid overflow-hidden rounded-2xl border border-white/10 bg-[oklch(14%_0.018_155)] p-8 sm:p-12"
      >
        <h1
          class="font-athletic text-3xl font-bold uppercase leading-[0.9] tracking-tight text-white text-center mb-2"
        >
          Forgot <span class="text-primary-400">Password</span>
        </h1>

        <p class="text-center text-sm font-medium text-gray-400 mb-8">
          Enter your email address to receive a reset link.
        </p>

        <div
          v-if="success"
          class="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4 text-center"
        >
          <UIcon
            name="i-heroicons-check-circle-solid"
            class="h-8 w-8 text-primary-400 mx-auto mb-2"
          />
          <p class="text-sm text-gray-300">
            If an account matching that email exists, we have sent a password reset link.
          </p>
        </div>

        <form v-else class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <UInput
              v-model="email"
              type="email"
              placeholder="Email address"
              required
              class="w-full"
              size="xl"
            />
          </div>
          <UButton
            type="submit"
            block
            size="xl"
            color="primary"
            variant="solid"
            class="h-14 min-w-full rounded-xl text-xs font-bold uppercase tracking-[0.15em]"
            :loading="loading"
          >
            Send Reset Link
          </UButton>
        </form>

        <div class="mt-6 text-center">
          <NuxtLink
            to="/login"
            class="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            &larr; Back to Login
          </NuxtLink>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
  const email = ref('')
  const loading = ref(false)
  const success = ref(false)
  const toast = useToast()

  definePageMeta({
    layout: 'home',
    middleware: ['guest'],
    auth: false
  })

  useSeoMeta({
    title: 'Forgot Password | Journey Endurance',
    description: 'Reset your Journey Endurance account password.'
  })

  async function handleSubmit() {
    loading.value = true
    try {
      await $fetch('/api/auth/forgot-password', {
        method: 'POST',
        body: { email: email.value }
      })
      success.value = true
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error.data?.statusMessage || 'An unexpected error occurred.',
        color: 'error'
      })
    } finally {
      loading.value = false
    }
  }
</script>
