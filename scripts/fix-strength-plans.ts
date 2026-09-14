import 'dotenv/config'
import { prisma } from '../server/utils/db'
import { applyStrengthLibraryDefaultsToWorkout } from '../server/utils/strength-exercise-matching'

async function main() {
  // 1. Get all library exercises
  const libraryExercises = await prisma.strengthExerciseLibraryItem.findMany()
  console.log(`Loaded ${libraryExercises.length} library exercises.`)

  // 2. Fetch templates to update
  const templates = await prisma.workoutTemplate.findMany({
    where: {
      tags: { has: 'Endurance Strength' }
    }
  })
  console.log(`Found ${templates.length} templates to update.`)

  for (const template of templates) {
    if (!template.structuredWorkout) continue

    const { structuredWorkout: updatedWorkout, matchedCount } = await applyStrengthLibraryDefaultsToWorkout({
      structuredWorkout: template.structuredWorkout,
      libraryExercises,
      userId: template.userId,
      entityType: 'WorkoutTemplate',
      entityId: template.id,
      operation: 'fix-strength-plans'
    })

    if (matchedCount > 0) {
      await prisma.workoutTemplate.update({
        where: { id: template.id },
        data: { structuredWorkout: updatedWorkout as any }
      })
      console.log(`Updated template '${template.title}' (Matched ${matchedCount} exercises)`)
    } else {
      console.log(`No matches found for template '${template.title}'`)
    }
  }

  // 3. Fetch planned workouts to update
  const plannedWorkouts = await prisma.plannedWorkout.findMany({
    where: {
      externalId: { startsWith: 'pw-strength-' }
    }
  })
  console.log(`Found ${plannedWorkouts.length} planned workouts to update.`)

  for (const pw of plannedWorkouts) {
    if (!pw.structuredWorkout) continue

    const { structuredWorkout: updatedWorkout, matchedCount } = await applyStrengthLibraryDefaultsToWorkout({
      structuredWorkout: pw.structuredWorkout,
      libraryExercises,
      userId: pw.userId,
      entityType: 'PlannedWorkout',
      entityId: pw.id,
      operation: 'fix-strength-plans'
    })

    if (matchedCount > 0) {
      await prisma.plannedWorkout.update({
        where: { id: pw.id },
        data: { structuredWorkout: updatedWorkout as any }
      })
      console.log(`Updated planned workout '${pw.title}' (Matched ${matchedCount} exercises)`)
    }
  }

  console.log('Finished fixing strength plans!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
