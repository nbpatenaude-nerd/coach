import { getServerSession } from '#auth'
import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  if (!session || !session.user || !(session.user as any).id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const userId = (session.user as any).id as string
  const body = await readBody(event)
  const { eventId, priority } = body

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event ID is required'
    })
  }

  try {
    // Check if event exists and get current participants
    const targetEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: {
          where: { userId: userId },
          select: { id: true, userId: true }
        }
      }
    })

    if (!targetEvent) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Event not found'
      })
    }

    const isParticipating = targetEvent.participants.length > 0

    if (isParticipating) {
      // Remove participation
      await prisma.eventParticipant.delete({
        where: { eventId_userId: { eventId, userId } }
      })
    } else {
      // Add participation
      await prisma.eventParticipant.create({
        data: {
          eventId,
          userId,
          priority: priority || targetEvent.priority || 'B'
        }
      })
    }

    const updatedEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: {
          select: {
            priority: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    })

    return updatedEvent
  } catch (error: any) {
    console.error('RSVP Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update RSVP status.'
    })
  }
})
