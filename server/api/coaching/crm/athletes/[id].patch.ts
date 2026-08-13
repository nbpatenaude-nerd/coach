export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const athleteId = event.context.params?.id

  if (!athleteId) {
    throw createError({ statusCode: 400, message: 'Athlete ID is required' })
  }

  if (user.role !== 'ADMIN' && user.role !== 'COACH') {
    throw createError({ statusCode: 403, message: 'Not authorized to view CRM' })
  }

  if (user.role === 'COACH') {
    const hasAccess = await prisma.coachAthlete.findFirst({
      where: { coachId: user.id, athleteId }
    })
    if (!hasAccess) {
      throw createError({ statusCode: 403, message: 'Not authorized to edit this athlete' })
    }
  }

  const body = await readBody(event)

  const updatedAthlete = await prisma.user.update({
    where: { id: athleteId },
    data: {
      pipelineStage: body.pipelineStage !== undefined ? body.pipelineStage : undefined,
      driveFolderId: body.driveFolderId !== undefined ? body.driveFolderId : undefined,
      crmTags: body.crmTags !== undefined ? body.crmTags : undefined
    }
  })

  return updatedAthlete
})
