import { z } from 'zod'
import { requireAuth } from '../../../utils/auth-guard'
import { prisma } from '../../../utils/db'
import { generateStructuredAnalysis } from '../../../utils/gemini'

const aiGeneratePlanSchema = z.object({
  prompt: z.string().min(3)
})

const generatedPlanSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Name of the training plan' },
    description: { type: 'string', description: 'Description of the plan and its goals' },
    strategy: { type: 'string', enum: ['LINEAR', 'UNDULATING', 'BLOCK', 'POLARIZED'] },
    blocks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['BASE', 'BUILD', 'PEAK', 'RECOVERY'] },
          durationWeeks: { type: 'integer' },
          weeks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                volumeTargetMinutes: { type: 'integer' },
                tssTarget: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  },
  required: ['name', 'description', 'strategy', 'blocks']
}

export default defineEventHandler(async (event) => {
  const authUser = await requireAuth(event, ['plan:write'])
  const body = await readBody(event)

  const validation = aiGeneratePlanSchema.safeParse(body)
  if (!validation.success) {
    throw createError({ statusCode: 400, message: validation.error.message })
  }

  const { prompt } = validation.data

  const aiResult = await generateStructuredAnalysis({
    systemInstruction:
      'You are an elite endurance sports coach. Given a user request for a training plan template, design a comprehensive macrocycle training plan consisting of blocks and weeks. Provide realistic volume and TSS targets.',
    prompt: `Create a training plan template based on this request: ${prompt}`,
    schema: generatedPlanSchema
  })

  const planData = aiResult.result

  // Create the plan template in the DB
  const plan = await (prisma as any).trainingPlan.create({
    data: {
      userId: authUser.id,
      name: planData.name,
      description: planData.description,
      strategy: planData.strategy,
      isTemplate: true,
      visibility: 'PRIVATE',
      accessState: 'PRIVATE',
      status: 'ACTIVE',
      blocks: {
        create: planData.blocks.map((block: any, bIdx: number) => ({
          name: block.name,
          order: bIdx + 1,
          type: block.type,
          primaryFocus: 'AEROBIC_ENDURANCE',
          durationWeeks: block.durationWeeks || block.weeks?.length || 4,
          startDate: new Date(0), // template dates are mostly ignored
          weeks: {
            create: (block.weeks || []).map((week: any, wIdx: number) => ({
              weekNumber: wIdx + 1,
              volumeTargetMinutes: week.volumeTargetMinutes,
              tssTarget: week.tssTarget,
              startDate: new Date(0),
              endDate: new Date(0)
            }))
          }
        }))
      }
    }
  })

  return { success: true, plan }
})
