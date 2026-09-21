import { requireAuth } from '../../../../utils/auth-guard'
import { prisma } from '../../../../utils/db'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const eventId = getRouterParam(event, 'id')

  if (!eventId) {
    throw createError({ statusCode: 400, message: 'Event ID is required' })
  }

  const body = await readBody(event)
  const isAttending = body?.attending === true

  try {
    const targetEvent = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!targetEvent || !targetEvent.isPublic) {
      throw createError({ statusCode: 404, message: 'Event not found or not public' })
    }

    if (isAttending) {
      // Create participant if not exists
      await prisma.eventParticipant.upsert({
        where: {
          eventId_userId: {
            eventId,
            userId: user.id
          }
        },
        update: {},
        create: {
          id: randomUUID(),
          eventId,
          userId: user.id
        }
      })
    } else {
      // Remove participant
      await prisma.eventParticipant.deleteMany({
        where: {
          eventId,
          userId: user.id
        }
      })
    }

    return { success: true, attending: isAttending }
  } catch (error) {
    console.error('Error updating event attendance:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update attendance'
    })
  }
})
