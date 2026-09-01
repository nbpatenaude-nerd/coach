import { requireAuth } from '~~/server/utils/auth-guard'
import { prisma } from '~~/server/utils/db'
import { PrismaClient } from '~~/server/utils/generated-prisma/client'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (!user.id) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const eventId = getRouterParam(event, 'id')
  if (!eventId) throw createError({ statusCode: 400, message: 'Missing event ID' })

  const body = await readBody(event)
  if (!body.content) throw createError({ statusCode: 400, message: 'Message content is required' })

  

  // verify the user is participating
  const participant = await prisma.eventParticipant.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } }
  })
  if (!participant) {
    throw createError({ statusCode: 403, message: 'Must be RSVPed to post messages' })
  }

  const message = await prisma.eventMessage.create({
    data: {
      eventId,
      userId: user.id,
      content: body.content
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  })

  return message
})
