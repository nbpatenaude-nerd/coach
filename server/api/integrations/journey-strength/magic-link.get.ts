import { defineEventHandler, sendRedirect, createError } from 'h3'
import { requireAuth } from '../../../utils/auth-guard'
import { prisma } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  // 1. Ensure the user is logged into Journey Endurance
  const user = await requireAuth(event)
  const userId = user.id

  // 2. Fetch their Journey Strength integration token
  const integration = await prisma.integration.findFirst({
    where: {
      userId,
      provider: 'journey_strength'
    }
  })

  if (!integration || !integration.accessToken) {
    // If they don't have an integration yet, we can redirect them to a setup/provisioning page,
    // or just show an error. For now, we'll throw a 403.
    return sendRedirect(
      event,
      process.env.JOURNEY_STRENGTH_URL ||
        'https://strength-production.up.railway.app/en/user/login',
      302
    )
  }

  // 3. Construct the Magic Link redirect URL
  const baseUrl = process.env.JOURNEY_STRENGTH_URL || 'https://strength-production.up.railway.app'
  const magicLink = `${baseUrl}/api/v2/magic-login/?token=${integration.accessToken}`

  // 4. Redirect the athlete's browser to the PWA with the token
  return sendRedirect(event, magicLink, 302)
})
