import 'dotenv/config'
import { prisma } from '../server/utils/db'
import { pbDetectionService } from '../server/utils/services/pbDetectionService'

async function main() {
  console.log('Fetching all workouts to recalculate PBs...')
  const workouts = await prisma.workout.findMany({
    select: { id: true, userId: true },
    where: {
      type: { in: ['Run', 'Ride', 'VirtualRide', 'Swim'] }
    }
  })

  console.log('Found ' + workouts.length + ' workouts.')

  let count = 0
  for (const w of workouts) {
    try {
      await pbDetectionService.detectPBs(w.id, prisma)
      count++
      if (count % 10 === 0) console.log('Processed ' + count + '/' + workouts.length)
    } catch (err) {
      console.error('Failed to process workout ' + w.id + ':', err)
    }
  }

  console.log('Finished recalculating all PBs!')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
