export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  if (user.role !== 'ADMIN' && user.role !== 'COACH') {
    throw createError({ statusCode: 403, message: 'Not authorized to view CRM' })
  }

  let athletes: any[]

  if (user.role === 'ADMIN') {
    athletes = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } else {
    const coachAthletes = await prisma.coachAthlete.findMany({
      where: { coachId: user.id },
      include: {
        athlete: true
      }
    })
    athletes = coachAthletes.map((ca: any) => ca.athlete)
  }

  return athletes
})
