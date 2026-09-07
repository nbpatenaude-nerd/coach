import { task } from '@trigger.dev/sdk/v3'
import { prisma } from '../server/utils/db'
import type { StrengthBlock, StrengthSetRow } from '../app/utils/strengthWorkout'

export const pushWorkoutToJourneyStrength = task({
  id: 'push-workout-to-journey-strength',
  retry: {
    maxAttempts: 3
  },
  run: async (payload: { plannedWorkoutId: string }, { ctx }) => {
    const plannedWorkout = await prisma.plannedWorkout.findUnique({
      where: { id: payload.plannedWorkoutId },
      include: {
        user: true,
        template: true
      }
    })

    if (!plannedWorkout || plannedWorkout.type !== 'WeightTraining') {
      return { success: false, message: 'Invalid or non-strength workout' }
    }

    const integration = await prisma.integration.findFirst({
      where: {
        userId: plannedWorkout.userId,
        provider: 'journey_strength'
      }
    })

    if (!integration || !integration.accessToken) {
      return { success: false, message: 'User not connected to Journey Strength' }
    }

    const structured = plannedWorkout.structuredWorkout as any
    if (!structured || !structured.blocks || !Array.isArray(structured.blocks)) {
      return { success: false, message: 'No structured strength blocks found' }
    }

    const token = integration.accessToken
    const baseUrl = process.env.JOURNEY_STRENGTH_URL || 'https://strength-production.up.railway.app'

    const headers = {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    }

    // 1. Create Routine
    const routineRes = await fetch(`${baseUrl}/api/v2/routine/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: plannedWorkout.title || 'Strength Workout',
        description: plannedWorkout.description || 'Assigned by Journey Endurance',
        background_color: '#00c56c'
      })
    })

    if (!routineRes.ok) {
      throw new Error(`Failed to create routine: ${await routineRes.text()}`)
    }
    const routine = await routineRes.json()
    const routineId = routine.id

    // 2. Create Blocks (Days) and Sets
    for (const block of structured.blocks as StrengthBlock[]) {
      // Create Day for this block
      const dayRes = await fetch(`${baseUrl}/api/v2/day/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          training: routineId,
          description: block.title || block.type,
          day: [1] // arbitrary day array as requested by wger api
        })
      })

      if (!dayRes.ok) {
        throw new Error(`Failed to create block (day): ${await dayRes.text()}`)
      }
      const day = await dayRes.json()
      const dayId = day.id

      // 3. Add Exercises (Sets) to the block
      let order = 1
      for (const step of block.steps) {
        // Build the exercises array based on set rows
        const setsCount = step.setRows.length || 1
        const repsVal = step.setRows[0]?.value ? parseInt(step.setRows[0].value) : 8
        const weightVal = step.setRows[0]?.loadValue ? parseFloat(step.setRows[0].loadValue) : 0

        // Map libraryExerciseId to wger exercise ID.
        // Fallback ID 111 if unmapped.
        const exerciseId = step.libraryExerciseId ? parseInt(step.libraryExerciseId.replace(/\D/g, '') || '111') : 111

        const setRes = await fetch(`${baseUrl}/api/v2/set/`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            exercisecategory: 9, // generic fallback
            set_type: 1, // normal
            day: dayId,
            order: order++,
            exercises: [
              {
                exercise: exerciseId,
                sets: setsCount,
                reps: isNaN(repsVal) ? 8 : repsVal,
                weight: isNaN(weightVal) ? 0 : weightVal
              }
            ]
          })
        })

        if (!setRes.ok) {
          throw new Error(`Failed to add set to block: ${await setRes.text()}`)
        }
      }
    }

    return { success: true, routineId }
  }
})
