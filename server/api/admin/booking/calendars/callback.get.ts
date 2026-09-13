import { prisma } from '../../../../../utils/db'
import { google } from 'googleapis'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = String(query.code ?? '')
  const userId = String(query.state ?? '')

  if (!code || !userId) {
    throw createError({ statusCode: 400, message: 'Missing code or state' })
  }

  const oauth2Client = getOAuthClient()
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)

  // Fetch the Google account email
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
  const userInfo = await oauth2.userinfo.get()
  const googleEmail = userInfo.data.email ?? 'Unknown'

  // Check for existing account
  const existing = await prisma.coachCalendarAccount.findFirst({
    where: { userId, googleEmail }
  })

  if (existing) {
    await prisma.coachCalendarAccount.update({
      where: { id: existing.id },
      data: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token ?? existing.refreshToken,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        isActive: true
      }
    })
  } else {
    await prisma.coachCalendarAccount.create({
      data: {
        userId,
        googleEmail,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope
      }
    })
  }

  return sendRedirect(event, '/admin/booking?connected=true')
})
