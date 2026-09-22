import { weekStartKey, type CheckInResponses } from '../../../../../shared/check-in'
import { parseFormDefinition } from '../../../../utils/services/weeklyCheckInService'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const athleteId = event.context.params?.id

  if (!athleteId) {
    throw createError({ statusCode: 400, message: 'Athlete ID is required' })
  }

  const isAdmin = user.isAdmin || user.role === 'ADMIN'
  if (!isAdmin && !user.isCoach) {
    throw createError({ statusCode: 403, message: 'Not authorized to view check-ins' })
  }

  if (!isAdmin) {
    const hasAccess = await prisma.coachingRelationship.findFirst({
      where: {
        coachId: user.id,
        athleteId,
        status: 'ACTIVE'
      }
    })

    if (!hasAccess) {
      throw createError({ statusCode: 403, message: 'Not authorized to view this athlete' })
    }
  }

  const checkIns = await prisma.weeklyCheckIn.findMany({
    where: { athleteId },
    orderBy: { weekStartDate: 'desc' },
    take: 52,
    include: {
      form: {
        select: {
          id: true,
          slug: true,
          title: true,
          version: true,
          sections: true
        }
      }
    }
  })

  return checkIns.map((row) => ({
    id: row.id,
    athleteId: row.athleteId,
    weekStartDate: weekStartKey(row.weekStartDate),
    submittedAt: row.submittedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    status: row.status,
    responses: (row.responses ?? {}) as CheckInResponses,
    coachNotes: row.coachNotes ?? row.coachFeedback,
    coachFeedback: row.coachFeedback ?? row.coachNotes,
    coachVideoUrl: row.coachVideoUrl,
    coachVideoAddedAt: row.coachVideoAddedAt?.toISOString() ?? null,
    coachReviewedAt: row.coachReviewedAt?.toISOString() ?? null,
    coachId: row.coachId,
    form: row.form
      ? {
          id: row.form.id,
          slug: row.form.slug,
          title: row.form.title,
          version: row.form.version,
          sections: parseFormDefinition(row.form.sections).sections
        }
      : null
  }))
})
