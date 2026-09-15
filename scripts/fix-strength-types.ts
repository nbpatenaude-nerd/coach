import 'dotenv/config'
import { prisma } from '../server/utils/db'

async function main() {
  console.log('Fixing type="Strength" to type="WeightTraining"...')

  const templatesResult = await prisma.workoutTemplate.updateMany({
    where: {
      type: 'Strength'
    },
    data: {
      type: 'WeightTraining'
    }
  })
  console.log(`Updated ${templatesResult.count} workout templates.`)

  const plannedWorkoutsResult = await prisma.plannedWorkout.updateMany({
    where: {
      type: 'Strength'
    },
    data: {
      type: 'WeightTraining'
    }
  })
  console.log(`Updated ${plannedWorkoutsResult.count} planned workouts.`)

  console.log('Done!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
