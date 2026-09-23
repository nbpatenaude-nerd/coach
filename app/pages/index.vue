<script setup lang="ts">
  /**
   * Root traffic router: send authenticated users to the app, everyone else to login.
   * Marketing content lives on dedicated public routes (e.g. /pricing, /tri-nerds).
   */
  definePageMeta({
    auth: false,
    layout: false
  })

  const { status, getSession } = useAuth()

  // Resolve session before redirecting so SSR and client agree (avoids layout flash).
  await getSession().catch(() => null)

  if (status.value === 'authenticated') {
    await navigateTo('/dashboard', { replace: true })
  } else {
    await navigateTo('/login', { replace: true })
  }
</script>

<template>
  <div aria-hidden="true" />
</template>
