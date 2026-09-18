import { prisma } from '../../../utils/db'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!(session?.user as any)?.id) throw createError({ statusCode: 401 })
  const query = getQuery(event)
  const status = String(query.status ?? 'CONFIRMED')
  const upcoming = query.upcoming === 'true'
  const bookings = await prisma.booking.findMany({
    where: {
      coachUserId: (session.user as any).id,
      status,
      ...(upcoming ? { startTime: { gte: new Date() } } : {})
    },
    include: { meetingType: { select: { name: true, durationMins: true } } },
    orderBy: { startTime: 'asc' }
  })
  return { bookings }
})
