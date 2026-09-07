import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  // Simple validation for webhook security (in production this should verify a signature)
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const token = authHeader.replace('Bearer ', '')
  if (token !== process.env.JOURNEY_STRENGTH_WEBHOOK_SECRET) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const body = await readBody(event)
  const eventType = body.event || body.eventType
  const externalUserId = body.user_id || body.externalUserId

  if (!externalUserId || !eventType) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing required fields' })
  }

  // Find the user mapped to this external ID
  const integration = await prisma.integration.findFirst({
    where: {
      provider: 'journey_strength',
      externalUserId: String(externalUserId)
    },
    include: {
      user: true
    }
  })

  if (!integration) {
    throw createError({ statusCode: 404, statusMessage: 'Integration not found for external user' })
  }

  const userId = integration.userId

  // Process the webhook payload
  if (eventType === 'workout.completed') {
    // Create a completed workout record on their calendar
    await prisma.workout.create({
      data: {
        userId,
        title: body.data?.title || 'Strength Workout',
        description: body.data?.description || 'Logged via Journey Strength',
        sport: 'Strength',
        workoutType: 'WeightTraining',
        date: new Date(body.data?.completedAt || body.date || Date.now()),
        status: 'COMPLETED',
        durationSec: body.data?.durationSec || 0,
        ownerScope: 'athlete'
      }
    })
    return { status: 'success', message: 'Workout logged' }

  } else if (eventType === 'nutrition.logged' || eventType === 'nutrition_daily_macros_updated') {
    // Upsert a WellnessRecord for today's macros
    const recordDate = new Date(body.date || body.data?.date || Date.now())
    // Normalize date to start of day UTC for checking
    recordDate.setUTCHours(0, 0, 0, 0)

    const calories = body.total_energy ?? body.data?.calories ?? 0
    const carbs = body.total_carbohydrates ?? body.data?.carbs ?? 0
    const protein = body.total_protein ?? body.data?.protein ?? 0
    const fat = body.total_fat ?? body.data?.fat ?? 0

    await prisma.wellnessRecord.upsert({
      where: {
        userId_date: {
          userId,
          date: recordDate
        }
      },
      update: {
        caloriesConsumed: calories,
        carbsGram: carbs,
        proteinGram: protein,
        fatGram: fat,
        source: 'JOURNEY_STRENGTH'
      },
      create: {
        userId,
        date: recordDate,
        caloriesConsumed: calories,
        carbsGram: carbs,
        proteinGram: protein,
        fatGram: fat,
        source: 'JOURNEY_STRENGTH'
      }
    })
    return { status: 'success', message: 'Nutrition logged' }
  }

  return { status: 'ignored', message: 'Unknown event type' }
})
