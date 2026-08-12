import { z } from 'zod'
import { defineEventHandler, createError, readBody } from 'h3'
import { requireAuth } from '../../utils/auth-guard'
import { prisma } from '../../utils/db'

defineRouteMeta({
  openAPI: {
    tags: ['Settings'],
    summary: 'Update AI settings',
    description: 'Updates the AI preferences for the authenticated user.',
    security: [{ bearerAuth: [] }],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              aiPersona: {
                type: 'string',
                enum: ['Analytical', 'Supportive', 'Drill Sergeant', 'Motivational']
              },
              aiModelPreference: { type: 'string', enum: ['flash', 'pro', 'experimental'] },
              aiAutoAnalyzeWorkouts: { type: 'boolean' },
              aiAutoAnalyzeNutrition: { type: 'boolean' },
              aiAutoAnalyzeReadiness: { type: 'boolean' },
              aiRequireToolApproval: { type: 'boolean' },
              aiProactivityEnabled: { type: 'boolean' },
              aiConversationalEngagement: { type: 'boolean' },
              aiMemoryEnabled: { type: 'boolean' },
              aiDeepAnalysisEnabled: { type: 'boolean' },
              aiContext: { type: 'string', nullable: true },
              nutritionTrackingEnabled: { type: 'boolean' },
              updateWorkoutNotesEnabled: { type: 'boolean' },
              nickname: { type: 'string', nullable: true },
              aiTtsStyle: { type: 'string', enum: ['coach', 'calm', 'direct', 'energetic'] },
              aiTtsVoiceName: { type: 'string' },
              aiTtsSpeed: { type: 'string', enum: ['slow', 'normal', 'fast'] },
              aiTtsAutoReadMessages: { type: 'boolean' }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Success',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                settings: {
                  type: 'object',
                  properties: {
                    aiPersona: { type: 'string' },
                    aiModelPreference: { type: 'string' },
                    aiAutoAnalyzeWorkouts: { type: 'boolean' },
                    aiAutoAnalyzeNutrition: { type: 'boolean' },
                    aiRequireToolApproval: { type: 'boolean' },
                    aiMemoryEnabled: { type: 'boolean' },
                    aiContext: { type: 'string', nullable: true },
                    nutritionTrackingEnabled: { type: 'boolean' },
                    updateWorkoutNotesEnabled: { type: 'boolean' },
                    nickname: { type: 'string', nullable: true },
                    aiTtsStyle: { type: 'string' },
                    aiTtsVoiceName: { type: 'string' },
                    aiTtsSpeed: { type: 'string' },
                    aiTtsAutoReadMessages: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      },
      400: { description: 'Invalid input' },
      401: { description: 'Unauthorized' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const authUser = await requireAuth(event, ['profile:write'])

  const body = await readBody(event)
  const {
    aiPersona,
    aiModelPreference,
    aiAutoAnalyzeWorkouts,
    aiAutoAnalyzeNutrition,
    aiAutoAnalyzeReadiness,
    aiRequireToolApproval,
    aiProactivityEnabled,
    aiConversationalEngagement,
    aiMemoryEnabled,
    aiDeepAnalysisEnabled,
    aiContext,
    nutritionTrackingEnabled,
    updateWorkoutNotesEnabled,
    nickname,
    aiTtsStyle,
    aiTtsVoiceName,
    aiTtsSpeed,
    aiTtsAutoReadMessages,
    aiWorkoutAutonomyLimit
  } = body

  // Validate inputs
  const validPersonas = ['Analytical', 'Supportive', 'Drill Sergeant', 'Motivational']
  const validModels = ['flash', 'pro', 'experimental']
  const validTtsStyles = ['coach', 'calm', 'direct', 'energetic']
  const validTtsSpeeds = ['slow', 'normal', 'fast']
  const validTtsVoices = [
    'Zephyr',
    'Puck',
    'Charon',
    'Kore',
    'Fenrir',
    'Leda',
    'Orus',
    'Aoede',
    'Callirrhoe',
    'Autonoe',
    'Enceladus',
    'Iapetus',
    'Umbriel',
    'Algieba',
    'Despina',
    'Erinome',
    'Algenib',
    'Rasalgethi',
    'Laomedeia',
    'Achernar',
    'Alnilam',
    'Schedar',
    'Gacrux',
    'Pulcherrima',
    'Achird',
    'Zubenelgenubi',
    'Vindemiatrix',
    'Sadachbia',
    'Sadaltager',
    'Sulafat'
  ]

  if (aiPersona && !validPersonas.includes(aiPersona)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid AI persona'
    })
  }

  if (aiModelPreference && !validModels.includes(aiModelPreference)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid AI model preference'
    })
  }

  if (aiWorkoutAutonomyLimit !== undefined) {
    if (
      typeof aiWorkoutAutonomyLimit !== 'number' ||
      aiWorkoutAutonomyLimit < 0 ||
      aiWorkoutAutonomyLimit > 100
    ) {
      throw createError({
        statusCode: 400,
        message: 'Invalid AI autonomy limit'
      })
    }
  }

  if (aiModelPreference && !validModels.includes(aiModelPreference)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid AI model preference'
    })
  }

  if (aiTtsStyle && !validTtsStyles.includes(aiTtsStyle)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid AI TTS style'
    })
  }

  if (aiTtsSpeed && !validTtsSpeeds.includes(aiTtsSpeed)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid AI TTS speed'
    })
  }

  if (aiTtsVoiceName && !validTtsVoices.includes(aiTtsVoiceName)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid AI TTS voice'
    })
  }

  const updateData: any = {}

  if (aiPersona !== undefined) updateData.aiPersona = aiPersona
  if (aiModelPreference !== undefined) updateData.aiModelPreference = aiModelPreference
  if (aiAutoAnalyzeWorkouts !== undefined) updateData.aiAutoAnalyzeWorkouts = aiAutoAnalyzeWorkouts
  if (aiAutoAnalyzeNutrition !== undefined)
    updateData.aiAutoAnalyzeNutrition = aiAutoAnalyzeNutrition
  if (aiAutoAnalyzeReadiness !== undefined)
    updateData.aiAutoAnalyzeReadiness = aiAutoAnalyzeReadiness
  if (aiRequireToolApproval !== undefined) updateData.aiRequireToolApproval = aiRequireToolApproval
  if (aiProactivityEnabled !== undefined) updateData.aiProactivityEnabled = aiProactivityEnabled
  if (aiConversationalEngagement !== undefined)
    updateData.aiConversationalEngagement = aiConversationalEngagement
  if (aiMemoryEnabled !== undefined) updateData.aiMemoryEnabled = aiMemoryEnabled
  if (aiDeepAnalysisEnabled !== undefined) updateData.aiDeepAnalysisEnabled = aiDeepAnalysisEnabled
  if (aiContext !== undefined) updateData.aiContext = aiContext
  if (nutritionTrackingEnabled !== undefined)
    updateData.nutritionTrackingEnabled = nutritionTrackingEnabled
  if (updateWorkoutNotesEnabled !== undefined)
    updateData.updateWorkoutNotesEnabled = updateWorkoutNotesEnabled
  if (nickname !== undefined) updateData.nickname = nickname
  if (aiTtsStyle !== undefined) updateData.aiTtsStyle = aiTtsStyle
  if (aiTtsVoiceName !== undefined) updateData.aiTtsVoiceName = aiTtsVoiceName
  if (aiTtsSpeed !== undefined) updateData.aiTtsSpeed = aiTtsSpeed
  if (aiTtsAutoReadMessages !== undefined) updateData.aiTtsAutoReadMessages = aiTtsAutoReadMessages

  const user = await prisma.user.update({
    where: { id: authUser.id },
    data: updateData,
    select: {
      aiPersona: true,
      aiModelPreference: true,
      aiAutoAnalyzeWorkouts: true,
      aiAutoAnalyzeNutrition: true,
      aiAutoAnalyzeReadiness: true,
      aiRequireToolApproval: true,
      aiProactivityEnabled: true,
      aiConversationalEngagement: true,
      aiMemoryEnabled: true,
      aiDeepAnalysisEnabled: true,
      aiContext: true,
      nutritionTrackingEnabled: true,
      updateWorkoutNotesEnabled: true,
      nickname: true,
      aiTtsStyle: true,
      aiTtsVoiceName: true,
      aiTtsSpeed: true,
      aiTtsAutoReadMessages: true
    }
  })

  return {
    success: true,
    settings: {
      ...user,
      aiWorkoutAutonomyLimit: aiWorkoutAutonomyLimit ?? 50
    }
  }
})
