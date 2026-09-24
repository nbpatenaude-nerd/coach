export const useNavigation = () => {
  const { data } = useAuth()

  // Safe role access with a fallback to FREE
  const role = computed(() => (data.value?.user as any)?.role || 'FREE')

  const isFree = computed(() => role.value === 'FREE')

  const isAdmin = computed(
    () => role.value === 'ADMIN' || (data.value?.user as any)?.isAdmin === true
  )

  const isCoach = computed(() => isAdmin.value || (data.value?.user as any)?.isCoach === true)

  return {
    role,
    isFree,
    isAdmin,
    isCoach
  }
}
