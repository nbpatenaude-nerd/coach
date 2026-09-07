import { defineEventHandler, readBody, createError, getQuery } from 'h3'
import { prisma } from '../../utils/db'
import { requireAuth } from '../../utils/auth-guard'
import { getEffectiveUserId } from '../../utils/coaching'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const userId = await getEffectiveUserId(event)

  const body = await readBody(event)
  const { plannedWorkoutId, title, durationSec, exercises } = body

  if (!plannedWorkoutId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing plannedWorkoutId' })
  }

  // Find the planned workout to verify ownership and get date
  const plannedWorkout = await prisma.plannedWorkout.findFirst({
    where: {
      id: String(plannedWorkoutId),
      userId
    }
  })

  if (!plannedWorkout) {
    throw createError({ statusCode: 404, statusMessage: 'Planned workout not found' })
  }

  // Create the completed workout
  const workout = await prisma.workout.create({
    data: {
      userId,
      externalId: 'strength-' + Date.now(),
      source: 'journey_endurance_player',
      title: title || plannedWorkout.title || 'Strength Workout',
      description: plannedWorkout.description,
      type: 'WeightTraining',
      date: new Date(), // Completed now
      durationSec: Number(durationSec) || 0
    }
  })

  // Create the exercises and sets
  if (Array.isArray(exercises)) {
    for (const [exerciseIndex, ex] of exercises.entries()) {
      if (!ex.name) continue

      // Look up or create Exercise
      let exercise = await prisma.exercise.findFirst({
        where: { title: ex.name }
      })
      if (!exercise) {
        exercise = await prisma.exercise.create({
          data: { title: ex.name, type: 'strength' }
        })
      }

      const workoutExercise = await prisma.workoutExercise.create({
        data: {
          workoutId: workout.id,
          exerciseId: exercise.id,
          notes: ex.notes || null,
          order: exerciseIndex,
          supersetId: ex.supersetId || null
        }
      })

      if (Array.isArray(ex.sets)) {
        for (const [setIndex, s] of ex.sets.entries()) {
          if (!s.reps && !s.weight && !s.durationSec && !s.distanceMeters && !s.rpe) continue // Skip empty sets

          await prisma.workoutSet.create({
            data: {
              workoutExerciseId: workoutExercise.id,
              reps: Number(s.reps) || null,
              weight: Number(s.weight) || null,
              weightUnit: s.weightUnit || 'lb',
              rpe: Number(s.rpe) || null,
              durationSec: Number(s.durationSec) || null,
              distanceMeters: Number(s.distanceMeters) || null,
              type: s.type || 'NORMAL',
              order: setIndex
            }
          })
        }
      }
    }
  }

  // Mark planned workout as completed
  await prisma.plannedWorkout.update({
    where: { id: plannedWorkout.id },
    data: { completed: true }
  })

  return { success: true, workoutId: workout.id }
})
