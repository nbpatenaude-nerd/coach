import { prisma } from '~/server/utils/db'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401 })
  const meetingTypes = await prisma.meetingType.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' }
  })
  return { meetingTypes }
})
