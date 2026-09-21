import { requireAuth } from '../../utils/auth-guard'
import { startOfWeek } from 'date-fns'
import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, [])

  // Get the Sunday of the current week
  const weekStartDate = startOfWeek(new Date(), { weekStartsOn: 0 })

  const checkIn = await prisma.checkIn.findFirst({
    where: {
      userId: user.id,
      createdAt: {
        gte: weekStartDate
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (!checkIn) {
    throw createError({ statusCode: 404, message: 'No check-in for this week yet' })
  }

  return checkIn
})
