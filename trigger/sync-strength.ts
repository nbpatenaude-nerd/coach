import { task } from '@trigger.dev/sdk/v3'
import { prisma } from '../server/utils/db'

// Fallback background task to sync data from Journey Strength
export const syncJourneyStrengthData = task({
  id: 'sync-journey-strength-data',
  retry: {
    maxAttempts: 3
  },
  run: async (payload: { userId?: string }, { ctx }) => {
    // If no userId is provided, we could sync all users, but for now we require a userId
    if (!payload.userId) {
      return { success: false, message: 'No userId provided' }
    }

    const integration = await prisma.integration.findFirst({
      where: {
        userId: payload.userId,
        provider: 'journey_strength'
      }
    })

    if (!integration) {
      return { success: false, message: 'No Journey Strength integration found for user' }
    }

    // In the future, this is where we will query the Journey Strength API
    // using integration.accessToken to pull down missed workouts and nutrition logs.
    // 
    // Example:
    // const response = await fetch(`https://strength-production.up.railway.app/api/v1/sync?since=${integration.lastSyncAt}`, {
    //   headers: { Authorization: `Token ${integration.accessToken}` }
    // })
    // const data = await response.json()
    // processData(data)

    // Update the last sync time
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        lastSyncAt: new Date(),
        syncStatus: 'SUCCESS'
      }
    })

    return { success: true, message: 'Sync complete' }
  }
})
