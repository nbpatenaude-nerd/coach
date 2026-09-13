import { prisma } from '~/server/utils/db'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401 })
  const body = await readBody(event)
  const { dayOfWeek, startTime, endTime, isActive } = body
  if (dayOfWeek === undefined || !startTime || !endTime) throw createError({ statusCode: 400 })
  const rule = await prisma.coachAvailabilityRule.upsert({
    where: { userId_dayOfWeek: { userId: session.user.id, dayOfWeek } },
    create: { userId: session.user.id, dayOfWeek, startTime, endTime, isActive: isActive ?? true },
    update: { startTime, endTime, isActive: isActive ?? true }
  })
  return { rule }
})
