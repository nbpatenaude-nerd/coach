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
          Reset <span class="text-primary-400">Password</span>
        </h1>

        <p class="text-center text-sm font-medium text-gray-400 mb-8">
          Enter your new password below.
        </p>

        <div v-if="isInvalidToken" class="text-center space-y-4">
          <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <UIcon name="i-heroicons-x-circle-solid" class="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p class="text-sm text-gray-300">This reset link has expired or is invalid.</p>
          </div>
          <UButton
            to="/auth/forgot-password"
            block
            size="xl"
            color="primary"
            variant="solid"
            class="h-14 min-w-full rounded-xl text-xs font-bold uppercase tracking-[0.15em]"
          >
            Request a new link
          </UButton>
        </div>

        <form v-else class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <UInput
              v-model="newPassword"
              type="password"
              placeholder="New Password"
              required
              class="w-full"
              size="xl"
            />
          </div>
          <div>
            <UInput
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm Password"
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
            Reset Password
          </UButton>
        </form>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  const newPassword = ref('')
  const confirmPassword = ref('')
  const loading = ref(false)
  const isInvalidToken = ref(false)

  const token = computed(() => route.query.token as string)

  definePageMeta({
    layout: 'home',
    middleware: ['guest'],
    auth: false
  })

  useSeoMeta({
    title: 'Reset Password | Journey Endurance',
    description: 'Reset your Journey Endurance account password.'
  })

  onMounted(() => {
    if (!token.value) {
      toast.add({
        title: 'Invalid Link',
        description: 'The password reset link is invalid or missing the token.',
        color: 'error'
      })
      isInvalidToken.value = true
    }
  })

  async function handleSubmit() {
    if (newPassword.value !== confirmPassword.value) {
      toast.add({
        title: 'Error',
        description: 'Passwords do not match.',
        color: 'error'
      })
      return
    }

    if (newPassword.value.length < 8) {
      toast.add({
        title: 'Error',
        description: 'Password must be at least 8 characters long.',
        color: 'error'
      })
      return
    }

    loading.value = true
    try {
      await $fetch('/api/auth/reset-password', {
        method: 'POST',
        body: { token: token.value, newPassword: newPassword.value }
      })

      toast.add({
        title: 'Success',
        description: 'Your password has been reset successfully. You can now log in.',
        color: 'success'
      })

      router.push('/login')
    } catch (error: any) {
      const statusCode = error.response?.status || error.statusCode
      if (statusCode === 400 || statusCode === 404) {
        isInvalidToken.value = true
        toast.add({
          title: 'Error',
          description: 'This reset link has expired or is invalid.',
          color: 'error'
        })
      } else {
        toast.add({
          title: 'Error',
          description: error.data?.statusMessage || 'An unexpected error occurred.',
          color: 'error'
        })
      }
    } finally {
      loading.value = false
    }
  }
</script>
