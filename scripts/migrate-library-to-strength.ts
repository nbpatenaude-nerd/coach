import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const JOURNEY_STRENGTH_URL = process.env.JOURNEY_STRENGTH_URL || 'https://strength-production.up.railway.app'
  const ADMIN_TOKEN = process.env.JOURNEY_STRENGTH_ADMIN_TOKEN

  if (!ADMIN_TOKEN) {
    console.error('Error: JOURNEY_STRENGTH_ADMIN_TOKEN environment variable is missing.')
    process.exit(1)
  }

  console.log('Fetching local exercise library...')
  const localExercises = await prisma.strengthExerciseLibraryItem.findMany()

  if (localExercises.length === 0) {
    console.log('No local exercises found.')
    return
  }

  console.log(`Found ${localExercises.length} local exercises. Migrating to Journey Strength...`)

  const MUSCLE_MAP: Record<string, number> = {
    'Biceps Brachii': 1,
    'Anterior Deltoid': 2,
    'Serratus Anterior': 3,
    'Pectoralis Major': 4,
    'Pectoralis Major (Sternal)': 4,
    'Pectoralis Major (Clavicular)': 4,
    'Triceps Brachii': 5,
    'Rectus Abdominis': 6,
    'Gastrocnemius': 7,
    'Gluteus Maximus': 8,
    'Trapezius': 9,
    'Quadriceps': 10,
    'Hamstrings': 11,
    'Latissimus Dorsi': 12,
    'Brachialis': 13,
    'Obliques': 14,
    'Soleus': 15
  }

  let successCount = 0
  let errorCount = 0

  for (const exercise of localExercises) {
    try {
      const mappedMuscles: number[] = []
      for (const group of exercise.targetMuscleGroups) {
        for (const [key, id] of Object.entries(MUSCLE_MAP)) {
          if (group.toLowerCase().includes(key.toLowerCase())) {
            mappedMuscles.push(id)
          }
        }
      }

      const payload = {
        name: exercise.title,
        description: exercise.notes || '',
        video_url: exercise.videoUrl || null,
        intent: exercise.intent || null,
        movement_pattern: exercise.movementPattern || null,
        muscles: [...new Set(mappedMuscles)], // Primary muscles array
        notes: `Original ExRx Targets: ${exercise.targetMuscleGroups.join(', ')}`
      }

      const response = await fetch(`${JOURNEY_STRENGTH_URL}/api/v2/exercise/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Status ${response.status}: ${await response.text()}`)
      }

      successCount++
      console.log(`[Success] Migrated: ${exercise.title}`)
    } catch (err: any) {
      errorCount++
      console.error(`[Error] Failed to migrate ${exercise.title}:`, err.message)
    }
  }

  console.log('\nMigration Complete!')
  console.log(`Successfully migrated: ${successCount}`)
  console.log(`Failed to migrate: ${errorCount}`)
  
  if (successCount > 0) {
    console.log('\nIMPORTANT: Remember to configure a Trigger.dev task to sync the unified library back to Journey Endurance!')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
