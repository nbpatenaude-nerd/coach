export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const athleteId = event.context.params?.id

  if (!athleteId) {
    throw createError({ statusCode: 400, message: 'Athlete ID is required' })
  }

  // Verify coach has access to this athlete OR is admin
  if (user.role !== 'ADMIN' && user.role !== 'COACH') {
    throw createError({ statusCode: 403, message: 'Not authorized to view check-ins' })
  }

  // If coach, verify relationship
  if (user.role === 'COACH') {
    const hasAccess = await prisma.coachAthlete.findFirst({
      where: {
        coachId: user.id,
        athleteId
      }
    })

    if (!hasAccess) {
      throw createError({ statusCode: 403, message: 'Not authorized to view this athlete' })
    }
  }

  const checkIns = await prisma.weeklyCheckIn.findMany({
    where: { athleteId },
    orderBy: { weekStartDate: 'desc' },
    take: 52 // Last year of check-ins
  })

  return checkIns
})
