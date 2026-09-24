export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const athleteId = event.context.params?.id
  if (!athleteId) {
    throw createError({ statusCode: 400, message: 'Athlete ID is required' })
  }

  if (!user.isCoach && !user.isAdmin) {
    throw createError({ statusCode: 403, message: 'Unauthorized' })
  }

  const drafts = await prisma.crmEmailDraft.findMany({
    where: { userId: athleteId },
    orderBy: { createdAt: 'desc' }
  })

  return drafts
})
