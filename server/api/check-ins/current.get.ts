import { startOfWeek } from 'date-fns'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  // Get the Sunday of the current week
  const weekStartDate = startOfWeek(new Date(), { weekStartsOn: 0 })

  const checkIn = await prisma.weeklyCheckIn.findUnique({
    where: {
      athleteId_weekStartDate: {
        athleteId: user.id,
        weekStartDate
      }
    }
  })

  if (!checkIn) {
    throw createError({ statusCode: 404, message: 'No check-in for this week yet' })
  }

  return checkIn
})
