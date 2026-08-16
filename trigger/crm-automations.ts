import './init'
import { logger, task } from '@trigger.dev/sdk/v3'
import { prisma } from '../server/utils/db'
import { generateObject } from 'ai'
import { createGoogle } from '@ai-sdk/google'
import { z } from 'zod'
import { generateLeadNurturePrompt } from '../server/utils/crm-email-prompts'

const google = createGoogle({
  apiKey: process.env.GEMINI_API_KEY
})

export const handleCrmStageChangeTask = task({
  id: 'handle-crm-stage-change',
  maxDuration: 120, // 2 mins max
  run: async (payload: { athleteId: string; newStageId: string }) => {
    logger.log('Processing CRM stage change', payload)

    const athlete = await prisma.user.findUnique({
      where: { id: payload.athleteId },
      include: {
        crmDeals: {
          include: { stage: true, pipeline: true }
        }
      }
    })

    if (!athlete) {
      logger.error('Athlete not found', { athleteId: payload.athleteId })
      return { success: false, error: 'Athlete not found' }
    }

    const deal = athlete.crmDeals.find((d) => d.stageId === payload.newStageId)
    if (!deal) {
      logger.error('Deal not found for new stage', { stageId: payload.newStageId })
      return { success: false, error: 'Deal not found' }
    }

    // Logic: If stage name contains 'Prospect' or 'Lead', draft a nurture email
    const stageName = deal.stage.name.toLowerCase()

    if (stageName.includes('prospect') || stageName.includes('lead')) {
      logger.info('Generating Lead Nurture Draft', { stage: stageName })

      const prompt = generateLeadNurturePrompt({
        name: athlete.name,
        currentFitnessScore: athlete.currentFitnessScore,
        leadSource: athlete.leadSource,
        notes: '' // We could fetch CoachNote here if needed
      })

      const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: z.object({
          subject: z.string(),
          body: z.string()
        }),
        prompt
      })

      // Human in the loop: Create a CrmEmailDraft instead of sending directly
      const draft = await prisma.crmEmailDraft.create({
        data: {
          userId: athlete.id,
          subject: object.subject,
          body: object.body,
          status: 'PENDING',
          promptId: 'lead_nurture_v1'
        }
      })

      logger.info('Draft created successfully', { draftId: draft.id })
      return { success: true, draftId: draft.id }
    }

    return { success: true, message: 'No automation required for this stage' }
  }
})
