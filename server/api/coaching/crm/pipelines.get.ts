import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  // Ensure they are a coach or admin

  if (!user.isCoach && !user.isAdmin) throw createError({ statusCode: 403, message: 'Forbidden' })

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
