import { prisma } from '../../../utils/db'
import { addDays, addHours } from 'date-fns'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const query = getQuery(event)
  const daysAhead = Number(query.days ?? 14)

  if (!slug) throw createError({ statusCode: 400, message: 'Missing slug' })

  const meetingType = await prisma.meetingType.findUnique({
    where: { slug },
    include: { user: { select: { id: true } } }
  })

  if (!meetingType || !meetingType.isActive) {
    throw createError({ statusCode: 404, message: 'Meeting type not found' })
  }

  const coachUserId = meetingType.User.id
  const now = new Date()
  const leadTimeCutoff = addHours(now, meetingType.leadTimeHours)
  const rangeEnd = addDays(now, daysAhead)

  const availabilityRules = await prisma.coachAvailabilityRule.findMany({
    where: { userId: coachUserId, isActive: true }
  })

  const confirmedBookings = await prisma.booking.findMany({
    where: {
      coachUserId,
      status: 'CONFIRMED',
      startTime: { gte: now, lte: rangeEnd }
    }
  })

  const busyFromCalendars = await getCoachBusyTimes(coachUserId, now, rangeEnd)

  const allBusy = [
    ...busyFromCalendars,
    ...confirmedBookings.map((b: any) => ({ start: b.startTime, end: b.endTime }))
  ]

  const result: Record<string, Array<{ start: string; end: string }>> = {}

  for (let i = 0; i < daysAhead; i++) {
    const day = addDays(now, i)
    const dayOfWeek = day.getDay()
    const rule = availabilityRules.find((r: any) => r.dayOfWeek === dayOfWeek)
    if (!rule) continue

    const daySlots = generateSlots(
      day,
      rule.startTime,
      rule.endTime,
      meetingType.durationMins,
      meetingType.bufferMins
    )

    const available = filterBusySlots(daySlots, allBusy).filter(
      (s: any) => s.start >= leadTimeCutoff
    )

    if (available.length > 0) {
      const dateKey = day.toISOString().split('T')[0] as string
      result[dateKey] = available.map((s: any) => ({
        start: s.start.toISOString(),
        end: s.end.toISOString()
      }))
    }
  }

  return {
    meetingType: {
      id: meetingType.id,
      name: meetingType.name,
      durationMins: meetingType.durationMins,
      description: meetingType.description,
      conferenceUrl: meetingType.conferenceUrl
    },
    slots: result
  }
})
