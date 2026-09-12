import os

content = """import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Find or create user
  let user = await prisma.user.findUnique({ where: { email: body.email } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
      }
    })
  }

  // Find first pipeline
  let pipeline = await prisma.crmPipeline.findFirst()
  if (!pipeline) {
    pipeline = await prisma.crmPipeline.create({
      data: {
        name: 'Sales Pipeline',
        stages: {
          create: [
            { name: 'Lead', order: 1 },
            { name: 'Contacted', order: 2 }
          ]
        }
      }
    })
  }

  // Get Lead stage
  let stage = await prisma.crmPipelineStage.findFirst({
    where: { pipelineId: pipeline.id },
    orderBy: { order: 'asc' }
  })

  if (stage) {
    // Create CRM Deal
    const deal = await prisma.crmDeal.create({
      data: {
        userId: user.id,
        pipelineId: pipeline.id,
        stageId: stage.id,
        name: `${body.tier} Application: ${body.name}`,
        status: 'OPEN'
      }
    })

    // Add form data as a task or note
    await prisma.crmTask.create({
      data: {
        dealId: deal.id,
        userId: user.id,
        title: 'Application Details',
        description: `Goals: ${body.goals}\nExperience: ${body.experience || 'N/A'}\nCommitment: ${body.commitment || 'N/A'}\nLimiters: ${body.limiters || 'N/A'}\nNutrition: ${body.nutrition || 'N/A'}`
      }
    })
  }

  return { success: true }
})"""

with open('d:/coach/server/api/apply/submit.post.ts', 'w', encoding='utf-8') as f:
    f.write(content)
