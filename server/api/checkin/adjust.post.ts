import { z } from 'zod'
import { requireAuth } from '../../utils/auth-guard'
import { prisma } from '../../utils/db'
import { getUserTimezone, getUserLocalDate } from '../../utils/date'

const bodySchema = z.object({
  checkinId: z.string(),
  status: z.enum(['ACCEPTED', 'REJECTED'])
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['health:write'])

  const body = await readBody(event)
  const result = bodySchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid payload', data: result.error.issues })
  }

  const { checkinId, status } = result.data

  const checkin = await prisma.dailyCheckin.findUnique({
    where: { id: checkinId }
  })

  if (!checkin) {
    throw createError({ statusCode: 404, message: 'Check-in not found' })
  }

  if (checkin.userId !== user.id) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  if (checkin.adjustmentStatus !== 'PENDING' || !checkin.proposedAdjustmentPercentage) {
    throw createError({ statusCode: 400, message: 'No pending adjustment found for this check-in' })
  }

  if (status === 'REJECTED') {
    return await prisma.dailyCheckin.update({
      where: { id: checkin.id },
      data: { adjustmentStatus: 'REJECTED' }
    })
  }

  // If ACCEPTED, apply to today's planned workouts
  const checkinDate = new Date(checkin.date)

  const plannedWorkouts = await prisma.plannedWorkout.findMany({
    where: {
      userId: user.id,
      date: checkinDate,
      completed: false
    }
  })

  const factor = 1 - checkin.proposedAdjustmentPercentage / 100

  for (const workout of plannedWorkouts) {
    await prisma.plannedWorkout.update({
      where: { id: workout.id },
      data: {
        durationSec: workout.durationSec
          ? Math.round(workout.durationSec * factor)
          : workout.durationSec,
        tss: workout.tss ? Number((workout.tss * factor).toFixed(1)) : workout.tss,
        workIntensity: workout.workIntensity
          ? Number((workout.workIntensity * factor).toFixed(2))
          : workout.workIntensity,
        description: `[AI Adjusted by -${checkin.proposedAdjustmentPercentage}%]\nReasoning: ${checkin.proposedAdjustmentReasoning}\n\n${workout.description || ''}`
      }
    })
  }

  const updatedCheckin = await prisma.dailyCheckin.update({
    where: { id: checkin.id },
    data: { adjustmentStatus: 'APPLIED' }
  })

  return updatedCheckin
})
