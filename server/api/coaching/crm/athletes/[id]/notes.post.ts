export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const athleteId = event.context.params?.id

  if (!athleteId) {
    throw createError({ statusCode: 400, message: 'Athlete ID is required' })
  }

  if (user.role !== 'ADMIN' && !user.isCoach) {
    throw createError({ statusCode: 403, message: 'Not authorized to view CRM' })
  }

  if (user.isCoach) {
    const hasAccess = await prisma.coachingRelationship.findFirst({
      where: { coachId: user.id, athleteId }
    })
    if (!hasAccess) {
      throw createError({ statusCode: 403, message: 'Not authorized to edit this athlete' })
    }
  }

  const body = await readBody(event)

  const newNote = await prisma.coachNote.create({
    data: {
      userId: athleteId,
      text: body.text,
      isAiSummary: body.isAiSummary || false
    }
  })

  return newNote
})
