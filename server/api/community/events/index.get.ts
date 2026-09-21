import { requireAuth } from '../../../utils/auth-guard'
import { prisma } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  try {
    const events = await prisma.event.findMany({
      where: { 
        isPublic: true 
      },
      orderBy: { date: 'asc' },
      include: { 
        EventParticipant: true 
      }
    })

    return events
  } catch (error) {
    console.error('Error fetching community events:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch community events'
    })
  }
})
