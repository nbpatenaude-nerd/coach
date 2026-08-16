export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  if (!session.user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const athleteId = event.context.params?.id
  if (!athleteId) {
    throw createError({ statusCode: 400, message: 'Athlete ID is required' })
  }

  const { isCoach, isAdmin } = await coachingRepository.getCoachStatus(session.user.id)
  if (!isCoach && !isAdmin) {
    throw createError({ statusCode: 403, message: 'Unauthorized' })
  }

  const drafts = await prisma.crmEmailDraft.findMany({
    where: { userId: athleteId },
    orderBy: { createdAt: 'desc' }
  })

  return drafts
})
