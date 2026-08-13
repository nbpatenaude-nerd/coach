export default defineNuxtRouteMiddleware((to) => {
  const { data } = useAuth()
  const user = data.value?.user

  // Ensure only coaches (or admins) can access these routes
  if (user && !((user as any).isCoach || (user as any).isAdmin)) {
    return navigateTo('/dashboard')
  }
})
