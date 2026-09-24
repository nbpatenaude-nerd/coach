import { getServerSession } from '../../../utils/session'
import { prisma } from '../../../utils/db'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const userId = (session.user as any).id

  // Generate a random token
  const token = crypto.randomBytes(16).toString('hex')
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  // Store in ShareToken
  await prisma.shareToken.create({
    data: {
      userId,
      resourceType: 'TELEGRAM_LINK',
      resourceId: 'TELEGRAM', // Placeholder
      token,
      expiresAt
    }
  })

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'JourneyEnduranceBot'
  return {
    url: `https://t.me/${botUsername}?start=${token}`
  }
})
