export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const athleteId = event.context.params?.id
  const noteId = event.context.params?.noteId

  if (!athleteId || !noteId) {
    throw createError({ statusCode: 400, message: 'Athlete ID and Note ID are required' })
  }

  if (user.role !== 'ADMIN' && user.role !== 'COACH') {
    throw createError({ statusCode: 403, message: 'Not authorized to view CRM' })
  }

  if (user.role === 'COACH') {
    const hasAccess = await prisma.coachAthlete.findFirst({
      where: { coachId: user.id, athleteId }
    })
    if (!hasAccess) {
      throw createError({ statusCode: 403, message: 'Not authorized to edit this athlete' })
    }
  }

  await prisma.coachNote.delete({
    where: { id: noteId, userId: athleteId }
  })

  return { success: true }
})
