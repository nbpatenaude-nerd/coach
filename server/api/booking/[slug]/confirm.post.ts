import { prisma } from '~/server/utils/db'
import { tasks } from '@trigger.dev/sdk/v3'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const body = await readBody(event)
  const {
    slotStart,
    slotEnd,
    prospectName,
    prospectEmail,
    prospectPhone,
    prospectNotes,
    timezone
  } = body

  if (!slug || !slotStart || !slotEnd || !prospectName || !prospectEmail || !timezone) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const meetingType = await prisma.meetingType.findUnique({
    where: { slug },
    include: { user: { select: { id: true, name: true, email: true } } }
  })

  if (!meetingType || !meetingType.isActive) {
    throw createError({ statusCode: 404, message: 'Meeting type not found' })
  }

  const start = new Date(slotStart)
  const end = new Date(slotEnd)

  const conflict = await prisma.booking.findFirst({
    where: {
      coachUserId: meetingType.userId,
      status: 'CONFIRMED',
      OR: [
        { startTime: { gte: start, lt: end } },
        { endTime: { gt: start, lte: end } },
        { startTime: { lte: start }, endTime: { gte: end } }
      ]
    }
  })

  if (conflict) {
    throw createError({
      statusCode: 409,
      message: 'This slot is no longer available. Please choose another time.'
    })
  }

  const booking = await prisma.booking.create({
    data: {
      meetingTypeId: meetingType.id,
      coachUserId: meetingType.userId,
      prospectName,
      prospectEmail,
      prospectPhone,
      prospectNotes,
      startTime: start,
      endTime: end,
      timezone,
      status: 'CONFIRMED'
    }
  })

  try {
    await tasks.trigger('book-appointment', {
      bookingId: booking.id,
      coachUserId: meetingType.userId,
      coachName: meetingType.user.name,
      coachEmail: meetingType.user.email,
      meetingTypeName: meetingType.name,
      conferenceUrl: meetingType.conferenceUrl
    })
  } catch (e) {
    console.error('Failed to trigger book-appointment task:', e)
  }

  return {
    success: true,
    booking: {
      id: booking.id,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      timezone: booking.timezone,
      cancelToken: booking.cancelToken
    }
  }
})
