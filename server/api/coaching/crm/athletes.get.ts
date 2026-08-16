import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  // Ensure they are a coach or admin

  if (!user.isCoach && !user.isAdmin) throw createError({ statusCode: 403, message: 'Forbidden' })

  const query = getQuery(event)
  const pipelineId = query.pipelineId ? String(query.pipelineId) : undefined

  let athletes: any[]

  // We want to fetch users who are either assigned to the coach OR are in the pipeline
  // But for now, since Admin sees all, and Coaches see their athletes:

  const include = {
    crmDeals: {
      where: pipelineId ? { pipelineId } : undefined,
      include: {
        stage: true
      }
    },
    crmTasks: {
      where: { isCompleted: false },
      orderBy: { dueDate: 'asc' as const }
    }
  }

  if (user.isAdmin) {
    athletes = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include
    })
  } else {
    // If coach, fetch coaching relationships
    const coachAthletes = await prisma.coachingRelationship.findMany({
      where: { coachId: user.id },
      include: {
        athlete: {
          include
        }
      }
    })
    athletes = coachAthletes.map((ca: any) => ca.athlete)
  }

  return athletes
})
