import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (!user.isCoach) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing ID' })
  }

  const body = await readValidatedBody(
    event,
    z.object({
      coachFeedback: z.string().optional(),
      coachVideoUrl: z.string().optional()
    }).parse
  )

  const updated = await prisma.weeklyCheckIn.update({
    where: { id },
    data: {
      coachFeedback: body.coachFeedback,
      coachVideoUrl: body.coachVideoUrl,
      coachId: user.id,
      coachReviewedAt: new Date()
    }
  })

  return updated
})
