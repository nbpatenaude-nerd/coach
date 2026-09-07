import { task } from '@trigger.dev/sdk/v3'
import { prisma } from '../server/utils/db'
import { metabolicService } from '../server/utils/services/metabolicService'

export const pushNutritionTargetsToJourneyStrength = task({
  id: 'push-nutrition-targets-to-journey-strength',
  retry: {
    maxAttempts: 3
  },
  run: async (payload: { userId: string; date: string }, { ctx }) => {
    const { userId, date } = payload
    const targetDate = new Date(date)

    // Check for integration
    const integration = await prisma.integration.findFirst({
      where: {
        userId,
        provider: 'journey_strength'
      }
    })

    if (!integration || !integration.accessToken) {
      return { success: false, message: 'User not connected to Journey Strength' }
    }

    // Get the calculated fueling plan for this date
    const result = await metabolicService.calculateFuelingPlanForDate(userId, targetDate, {
      persist: false
    })
    const plan = result.plan as any

    if (!plan || !plan.dailyTotals) {
      return { success: false, message: 'No nutrition targets calculated for date' }
    }

    const { calories, protein, carbs, fat, fuelState } = plan.dailyTotals

    const baseUrl = process.env.JOURNEY_STRENGTH_URL || 'https://strength-production.up.railway.app'
    const token = integration.accessToken

    // Push to Journey Strength
    const response = await fetch(`${baseUrl}/api/v2/nutritionplan/`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        creation_date: targetDate.toISOString().split('T')[0],
        description: `Journey Endurance Auto-Targets (Fuel State ${fuelState || 1})`,
        goal_energy: Math.round(calories),
        goal_protein: Math.round(protein),
        goal_carbohydrates: Math.round(carbs),
        goal_fat: Math.round(fat)
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to push nutrition targets: ${await response.text()}`)
    }

    return { success: true, message: 'Nutrition targets pushed to Journey Strength' }
  }
})
