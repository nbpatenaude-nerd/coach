import { task } from '@trigger.dev/sdk/v3'
import { prisma } from '../server/utils/db'

export const syncJourneyStrengthLibrary = task({
  id: 'sync-journey-strength-library',
  retry: {
    maxAttempts: 3
  },
  run: async (payload: any, { ctx }) => {
    const baseUrl = process.env.JOURNEY_STRENGTH_URL || 'https://strength-production.up.railway.app'
    const adminToken = process.env.JOURNEY_STRENGTH_ADMIN_TOKEN

    if (!adminToken) {
      return { success: false, message: 'Missing admin token for Journey Strength' }
    }

    // Fetch the unified library from Journey Strength
    // Depending on wger's pagination, we might need to loop `next` URLs
    let url = `${baseUrl}/api/v2/exercise/?limit=500`
    const allExercises = []

    while (url) {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${adminToken}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch library: ${await response.text()}`)
      }

      const data = await response.json()
      if (data.results) {
        allExercises.push(...data.results)
      }
      url = data.next // wger pagination returns the next URL
    }

    if (allExercises.length === 0) {
      return { success: true, message: 'No exercises found in Journey Strength API' }
    }

    // We need to identify a system user or default coach to own the library items globally
    const systemUser = await prisma.user.findFirst() // Fallback
    const userId = systemUser?.id || 'system'

    let upsertCount = 0

    // Upsert them into our read-only cache
    for (const exercise of allExercises) {
      // Wger IDs are integers. We will prefix them so we don't conflict with any legacy UUIDs
      const exerciseId = `wger-${exercise.id}`
      
      await prisma.strengthExerciseLibraryItem.upsert({
        where: { id: exerciseId },
        update: {
          title: exercise.name,
          notes: exercise.description || '',
          videoUrl: exercise.video_url || null,
          intent: exercise.intent || null,
          movementPattern: exercise.movement_pattern || null,
          // Storing the muscle IDs as strings just for basic filtering capability if needed
          targetMuscleGroups: exercise.muscles ? exercise.muscles.map(String) : []
        },
        create: {
          id: exerciseId,
          userId,
          title: exercise.name,
          notes: exercise.description || '',
          videoUrl: exercise.video_url || null,
          intent: exercise.intent || null,
          movementPattern: exercise.movement_pattern || null,
          targetMuscleGroups: exercise.muscles ? exercise.muscles.map(String) : []
        }
      })
      upsertCount++
    }

    return { 
      success: true, 
      message: `Successfully synced ${upsertCount} exercises from Journey Strength` 
    }
  }
})
