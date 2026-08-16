import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  if (!session.user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  // Ensure they are a coach or admin
  const { isCoach, isAdmin } = await coachingRepository.getCoachStatus(session.user.id)
  if (!isCoach && !isAdmin) throw createError({ statusCode: 403, message: 'Forbidden' })

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

  if (isAdmin) {
    athletes = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include
    })
  } else {
    // If coach, fetch coaching relationships
    const coachAthletes = await prisma.coachingRelationship.findMany({
      where: { coachId: session.user.id },
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
