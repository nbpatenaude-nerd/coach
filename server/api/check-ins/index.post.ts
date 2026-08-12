import { z } from 'zod'
import { startOfWeek } from 'date-fns'

const bodySchema = z.object({
  feelingScore: z.number().min(1).max(10),
  fatigueScore: z.number().min(1).max(10),
  stressScore: z.number().min(1).max(10),
  sleepQuality: z.number().min(1).max(10),
  notes: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readValidatedBody(event, bodySchema.parse)

  // Get the Sunday of the current week
  const weekStartDate = startOfWeek(new Date(), { weekStartsOn: 0 })

  // Find the coach to assign this check-in to
  const coachRel = await prisma.coachAthlete.findFirst({
    where: { athleteId: user.id },
    orderBy: { createdAt: 'desc' } // Most recent coach
  })

  // Create or update the check-in for this week
  const checkIn = await prisma.weeklyCheckIn.upsert({
    where: {
      athleteId_weekStartDate: {
        athleteId: user.id,
        weekStartDate
      }
    },
    update: {
      ...body,
      submittedAt: new Date()
    },
    create: {
      athleteId: user.id,
      coachId: coachRel?.coachId,
      weekStartDate,
      ...body
    }
  })

  return checkIn
})
