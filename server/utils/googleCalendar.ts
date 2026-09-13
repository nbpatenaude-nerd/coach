import { google } from 'googleapis'
import { prisma } from './db'

const SCOPES = ['https://www.googleapis.com/auth/calendar.freebusy']

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NUXT_PUBLIC_SITE_URL}api/admin/booking/calendars/callback`
  )
}

export function getAuthUrl(state?: string) {
  const oauth2Client = getOAuthClient()
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state: state ?? ''
  })
}

export async function refreshAccountToken(accountId: string) {
  const account = await prisma.coachCalendarAccount.findUnique({
    where: { id: accountId }
  })
  if (!account?.refreshToken) throw new Error('No refresh token available')

  const oauth2Client = getOAuthClient()
  oauth2Client.setCredentials({ refresh_token: account.refreshToken })
  const { credentials } = await oauth2Client.refreshAccessToken()

  await prisma.coachCalendarAccount.update({
    where: { id: accountId },
    data: {
      accessToken: credentials.access_token!,
      expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null
    }
  })

  return credentials.access_token!
}

export interface BusyInterval {
  start: Date
  end: Date
}

export async function getCoachBusyTimes(
  coachUserId: string,
  timeMin: Date,
  timeMax: Date
): Promise<BusyInterval[]> {
  const accounts = await prisma.coachCalendarAccount.findMany({
    where: { userId: coachUserId, isActive: true }
  })

  const allBusy: BusyInterval[] = []

  for (const account of accounts) {
    try {
      let accessToken = account.accessToken
      if (account.expiresAt && account.expiresAt < new Date()) {
        accessToken = await refreshAccountToken(account.id)
      }

      const oauth2Client = getOAuthClient()
      oauth2Client.setCredentials({ access_token: accessToken })

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          items: [{ id: 'primary' }]
        }
      })

      const busy = response.data.calendars?.primary?.busy ?? []
      for (const interval of busy) {
        if (interval.start && interval.end) {
          allBusy.push({
            start: new Date(interval.start),
            end: new Date(interval.end)
          })
        }
      }
    } catch (err) {
      console.error(`Failed to fetch free/busy for account ${account.id}:`, err)
    }
  }

  return allBusy
}

export function generateSlots(
  date: Date,
  startTimeStr: string,
  endTimeStr: string,
  durationMins: number,
  bufferMins: number
): Array<{ start: Date; end: Date }> {
  const slots: Array<{ start: Date; end: Date }> = []

  const [startH, startM] = startTimeStr.split(':').map(Number)
  const [endH, endM] = endTimeStr.split(':').map(Number)

  const dayStart = new Date(date)
  dayStart.setHours(startH || 0, startM || 0, 0, 0)

  const dayEnd = new Date(date)
  dayEnd.setHours(endH || 0, endM || 0, 0, 0)

  const slotDuration = (durationMins + bufferMins) * 60 * 1000
  let cursor = dayStart.getTime()

  while (cursor + durationMins * 60 * 1000 <= dayEnd.getTime()) {
    slots.push({
      start: new Date(cursor),
      end: new Date(cursor + durationMins * 60 * 1000)
    })
    cursor += slotDuration
  }

  return slots
}

export function filterBusySlots(
  slots: Array<{ start: Date; end: Date }>,
  busyIntervals: BusyInterval[]
): Array<{ start: Date; end: Date }> {
  return slots.filter((slot) => {
    return !busyIntervals.some((busy) => slot.start < busy.end && slot.end > busy.start)
  })
}
