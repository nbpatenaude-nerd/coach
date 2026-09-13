import { prisma } from '~/server/utils/db'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!(session?.user as any)?.id) throw createError({ statusCode: 401 })
  const rules = await prisma.coachAvailabilityRule.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { dayOfWeek: 'asc' }
  })
  return { rules }
})
