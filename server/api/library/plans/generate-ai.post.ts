import { z } from 'zod'
import { requireAuth } from '../../../utils/auth-guard'
import { prisma } from '../../../utils/db'
import { generateStructuredAnalysis } from '../../../utils/gemini'

const aiGeneratePlanSchema = z.object({
  prompt: z.string().min(3)
})

const generatedPlanSchema = z.object({
  name: z.string().describe('Name of the training plan'),
  description: z.string().describe('Description of the plan and its goals'),
  strategy: z.enum(['LINEAR', 'UNDULATING', 'BLOCK', 'POLARIZED']),
  blocks: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['BASE', 'BUILD', 'PEAK', 'RECOVERY']),
      durationWeeks: z.number().int(),
      weeks: z.array(
        z.object({
          volumeTargetMinutes: z.number().int(),
          tssTarget: z.number().int()
        })
      )
    })
  )
})

export default defineEventHandler(async (event) => {
  const authUser = await requireAuth(event, ['plan:write'])
  const body = await readBody(event)

  const validation = aiGeneratePlanSchema.safeParse(body)
  if (!validation.success) {
    throw createError({ statusCode: 400, message: validation.error.message })
  }

  const { prompt } = validation.data

  const systemInstruction = `You are an elite endurance sports coach with expertise in periodization and training methodology.
Given a user request for a training plan template, design a comprehensive macrocycle training plan consisting of blocks and weeks.
Follow these principles:
- **Periodization:** Structure the blocks logically (e.g., Base -> Build -> Peak/Taper).
- **Progression:** Ensure progressive overload across weeks, typically building volume/TSS for 2-3 weeks followed by a recovery week.
- **Realistic Loads:** Provide realistic volume and TSS targets suitable for the athlete level or distance requested.
- **Valid Enums:** Strictly adhere to the allowed schema enums for block types (BASE, BUILD, PEAK, RECOVERY) and plan strategy (LINEAR, UNDULATING, BLOCK, POLARIZED).`

  const planData = await generateStructuredAnalysis<any>(
    `${systemInstruction}\n\nCreate a training plan template based on this request: ${prompt}`,
    generatedPlanSchema,
    'flash',
    { operation: 'generate_plan_template', userId: authUser.id }
  )

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
