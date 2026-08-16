import { z } from 'zod'

const schema = z.object({
  athleteId: z.string().min(1),
  pipelineId: z.string().optional(),
  stageId: z.string().optional(),
  crmTags: z.array(z.string()).optional(),
  leadSource: z.string().optional().nullable(),
  churnRisk: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  if (!session.user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { isCoach, isAdmin } = await coachingRepository.getCoachStatus(session.user.id)
  if (!isCoach && !isAdmin) {
    throw createError({ statusCode: 403, message: 'Unauthorized' })
  }

  const body = await readValidatedBody(event, (b) => schema.parse(b))

  if (!isAdmin) {
    const isCoaching = await coachingRepository.checkRelationship(session.user.id, body.athleteId)
    if (!isCoaching) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to access this athlete.'
      })
    }
  }

  // Update user fields
  const userUpdateData: any = {}
  if (body.crmTags !== undefined) userUpdateData.crmTags = body.crmTags
  if (body.leadSource !== undefined) userUpdateData.leadSource = body.leadSource
  if (body.churnRisk !== undefined) userUpdateData.churnRisk = body.churnRisk

  let updatedAthlete: any = null
  if (Object.keys(userUpdateData).length > 0) {
    updatedAthlete = await prisma.user.update({
      where: { id: body.athleteId },
      data: userUpdateData,
      select: { id: true, crmTags: true, leadSource: true, churnRisk: true }
    })
  }

  // Update Deal if pipelineId and stageId are provided
  if (body.pipelineId && body.stageId) {
    // Find existing deal for this pipeline and athlete
    const existingDeal = await prisma.crmDeal.findFirst({
      where: {
        userId: body.athleteId,
        pipelineId: body.pipelineId
      }
    })

    if (existingDeal) {
      await prisma.crmDeal.update({
        where: { id: existingDeal.id },
        data: { stageId: body.stageId }
      })
    } else {
      await prisma.crmDeal.create({
        data: {
          userId: body.athleteId,
          pipelineId: body.pipelineId,
          stageId: body.stageId,
          name: 'Deal'
        }
      })
    }
  }

  return { success: true, data: updatedAthlete }
})
