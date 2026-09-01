import { PrismaClient } from '~~/server/utils/generated-prisma/client'

export default defineEventHandler(async (event) => {
  const session = await requireAuthSession(event)
  if (!session.user?.id) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const eventId = getRouterParam(event, 'id')
  if (!eventId) throw createError({ statusCode: 400, message: 'Missing event ID' })

  const db = await getPrisma()

  const messages = await db.eventMessage.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  return messages
})
