import { useNavigation } from '~/composables/useNavigation'

export default defineNuxtRouteMiddleware((to) => {
  const { isCoach } = useNavigation()

  // Ensure only coaches (or admins) can access these routes
  if (!isCoach.value) {
    return navigateTo('/dashboard')
  }
})
