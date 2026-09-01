import { z } from 'zod/v3'
import { requireAuth } from '../../../../utils/auth-guard'
import { prisma } from '../../../../utils/db'
import { requireCoachAccessToAthlete } from '../../../../utils/coaching-auth'
import { createPlannedWorkoutForUser } from '../../../../utils/planned-workout-service'

const applyWorkoutSchema = z.object({
  date: z.string(),
  athleteId: z.string().optional()
})

function normalizeDate(value: string) {
  const raw = new Date(value)
  if (Number.isNaN(raw.getTime())) {
    throw createError({ statusCode: 400, message: 'Invalid date.' })
  }
  return new Date(Date.UTC(raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate()))
}

export default defineEventHandler(async (event) => {
  const coach = await requireAuth(event, ['coaching:write'])

  const templateId = getRouterParam(event, 'id')
  if (!templateId) {
    throw createError({ statusCode: 400, message: 'Template ID is required.' })
  }

  const body = applyWorkoutSchema.parse(await readBody(event))
  const coachId = coach.id
  const targetUserId = body.athleteId || coachId

  if (targetUserId !== coachId) {
    await requireCoachAccessToAthlete(event, targetUserId, ['coaching:write'])
  }

  const template = await prisma.workoutTemplate.findFirst({
    where: {
      id: templateId,
      userId: coachId
    }
  })

  if (!template) {
    throw createError({ statusCode: 404, message: 'Workout template not found.' })
  }

  const workoutDate = normalizeDate(body.date)

  const createdWorkout = await createPlannedWorkoutForUser(targetUserId, {
    date: workoutDate.toISOString(),
    title: template.title,
    description: template.description || '',
    type: template.type,
    category: template.category || 'Workout',
    durationSec: template.durationSec,
    tss: template.tss,
    workIntensity: template.workIntensity,
    structuredWorkout: template.structuredWorkout ? template.structuredWorkout : undefined
  })

  await prisma.workoutTemplate.update({
    where: { id: templateId },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date()
    }
  })

  return {
    success: true,
    workoutId: createdWorkout.workout.id,
    targetUserId
  }
})
