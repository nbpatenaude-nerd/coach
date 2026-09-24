export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const athleteId = event.context.params?.id
  if (!athleteId) {
    throw createError({ statusCode: 400, message: 'Athlete ID is required' })
  }

  if (!user.isCoach && !user.isAdmin) {
    throw createError({ statusCode: 403, message: 'Unauthorized' })
  }

  if (!user.isAdmin) {
    const isCoaching = await coachingRepository.checkRelationship(user.id, athleteId)
    if (!isCoaching) {
      throw createError({ statusCode: 403, message: 'Not authorized to edit this athlete' })
    }
  }

  const body = await readBody(event)

  const updateData: any = {}
  if (body.driveFolderId !== undefined) updateData.driveFolderId = body.driveFolderId
  if (body.crmTags !== undefined) updateData.crmTags = body.crmTags
  if (body.leadSource !== undefined) updateData.leadSource = body.leadSource
  if (body.churnRisk !== undefined) updateData.churnRisk = body.churnRisk

  let updatedAthlete: any = null
  if (Object.keys(updateData).length > 0) {
    updatedAthlete = await prisma.user.update({
      where: { id: athleteId },
      data: updateData
    })
  }

  if (body.pipelineId && body.stageId) {
    const existingDeal = await prisma.crmDeal.findFirst({
      where: { userId: athleteId, pipelineId: body.pipelineId }
    })

    let isStageChanged = false

    if (existingDeal) {
      if (existingDeal.stageId !== body.stageId) isStageChanged = true
      await prisma.crmDeal.update({
        where: { id: existingDeal.id },
        data: { stageId: body.stageId }
      })
    } else {
      isStageChanged = true
      await prisma.crmDeal.create({
        data: {
          userId: athleteId,
          pipelineId: body.pipelineId,
          stageId: body.stageId,
          name: 'Deal'
        }
      })
    }

    if (isStageChanged) {
      const { tasks } = await import('@trigger.dev/sdk/v3')
      await tasks.trigger('handle-crm-stage-change', {
        athleteId,
        newStageId: body.stageId
      })
    }
  }

  return updatedAthlete || { success: true }
})
