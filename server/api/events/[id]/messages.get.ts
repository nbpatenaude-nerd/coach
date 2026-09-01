import { requireAuth } from '~~/server/utils/auth-guard'
import { prisma } from '~~/server/utils/db'
import { PrismaClient } from '~~/server/utils/generated-prisma/client'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (!user.id) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const eventId = getRouterParam(event, 'id')
  if (!eventId) throw createError({ statusCode: 400, message: 'Missing event ID' })

  

  const messages = await prisma.eventMessage.findMany({
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
