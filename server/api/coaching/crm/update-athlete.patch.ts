import { z } from 'zod'

const schema = z.object({
  athleteId: z.string().min(1),
  pipelineStage: z.string().optional(),
  crmTags: z.array(z.string()).optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (!(user as any).isCoach && !(user as any).isAdmin) {
    throw createError({ statusCode: 403, message: 'Unauthorized' })
  }

  const body = await readValidatedBody(event, (b) => schema.parse(b))

  if (!(user as any).isAdmin) {
    const isCoaching = await coachingRepository.checkRelationship(user.id, body.athleteId)
    if (!isCoaching) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to access this athlete.'
      })
    }
  }

  const updateData: any = {}
  if (body.pipelineStage !== undefined) updateData.pipelineStage = body.pipelineStage
  if (body.crmTags !== undefined) updateData.crmTags = body.crmTags

  const updatedAthlete = await prisma.user.update({
    where: { id: body.athleteId },
    data: updateData,
    select: { id: true, pipelineStage: true, crmTags: true }
  })

  return { success: true, data: updatedAthlete }
})
