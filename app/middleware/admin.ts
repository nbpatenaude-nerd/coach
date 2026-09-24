export default defineNuxtRouteMiddleware(async (to, from) => {
  const config = useRuntimeConfig()

  // Check if auth bypass is enabled
  if (config.public.authBypassEnabled) {
    return
  }

  const { isAdmin } = useNavigation()
  if (!isAdmin.value) {
    return navigateTo('/dashboard')
  }
})
