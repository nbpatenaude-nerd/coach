import { requireAuth } from '../../utils/auth-guard'
import { prisma } from '../../utils/db'

defineRouteMeta({
  openAPI: {
    tags: ['Events'],
    summary: 'List community events',
    description: 'Returns a list of public racing/life events for the community calendar.',
    responses: {
      200: { description: 'Success' },
      401: { description: 'Unauthorized' }
    }
  }
})

export default defineEventHandler(async (event) => {
  await requireAuth(event, ['goal:read'])

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const events = await prisma.event.findMany({
      where: {
        isPublic: true,
        date: { gte: today }
      },
      orderBy: { date: 'asc' },
      include: {
        participants: {
          include: {
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

    // Map to preserve frontend compatibility
    return events.map((event) => {
      return {
        ...event,
        participants: event.participants.map((p) => ({
          id: p.user.id,
          name: p.user.name,
          image: p.user.image,
          priority: p.priority
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching community events:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch community events'
    })
  }
})
