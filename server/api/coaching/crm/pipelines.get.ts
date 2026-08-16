import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  if (!session.user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  // Ensure they are a coach or admin
  const { isCoach, isAdmin } = await coachingRepository.getCoachStatus(session.user.id)
  if (!isCoach && !isAdmin) throw createError({ statusCode: 403, message: 'Forbidden' })

  // Fetch active pipelines and their stages ordered by 'order'
  const pipelines = await prisma.crmPipeline.findMany({
    where: {
      isActive: true
    },
    include: {
      stages: {
        orderBy: {
          order: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  return pipelines
})
