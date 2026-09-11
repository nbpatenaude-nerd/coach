const DEACTIVATED_LOGIN_PATH = '/login?error=deactivated'

export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig()

  if (config.public.authBypassEnabled) {
    return
  }

  const { status, data, getSession, signOut } = useAuth()

  // Always refresh so session deletion / deactivatedAt from the DB is observed.
  await getSession().catch(() => null)

  if (status.value === 'loading') {
    return
  }

  if (status.value !== 'authenticated') {
    return navigateTo(`/login?callbackUrl=${encodeURIComponent(to.fullPath)}`)
  }

  const user = data.value?.user as any
  const deactivatedAt = user?.deactivatedAt

  if (deactivatedAt) {
    return signOut({
      callbackUrl: DEACTIVATED_LOGIN_PATH
    }) as Promise<void>
  }

  // Check subscription standing
  if (to.path !== '/settings/billing' && to.path !== '/pricing' && !to.path.startsWith('/api/')) {
    const now = new Date()
    const periodEnd = user?.subscriptionPeriodEnd
      ? new Date(user.subscriptionPeriodEnd)
      : new Date(0)
    const trialEnd = user?.trialEndsAt ? new Date(user.trialEndsAt) : new Date(0)

    const isContributor = user?.subscriptionStatus === 'CONTRIBUTOR'
    const isActive = user?.subscriptionStatus === 'ACTIVE'
    const hasValidPeriodEnd = periodEnd > now
    const hasValidTrial = trialEnd > now

    const isGoodStanding = isContributor || isActive || hasValidPeriodEnd || hasValidTrial

    if (!isGoodStanding) {
      if (user?.subscriptionStatus === 'NONE' || !user?.stripeSubscriptionId) {
        return navigateTo('/pricing?upgrade_required=true')
      } else {
        return navigateTo('/settings/billing?upgrade_required=true')
      }
    }
  }
})
