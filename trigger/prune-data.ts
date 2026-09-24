import './init'
import { logger, schedules } from '@trigger.dev/sdk/v3'
import { prisma } from '../server/utils/db'

export const pruneOldWorkoutsTask = schedules.task({
  id: 'prune-old-workouts',
  cron: '0 3 * * *', // Run at 3 AM daily
  run: async (payload) => {
    logger.log('Starting daily pruning of 12-month old telemetry data', {
      timestamp: payload.timestamp
    })

    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    try {
      // Find workouts older than 12 months
      const oldWorkouts = await prisma.workout.findMany({
        where: {
          date: {
            lt: twelveMonthsAgo
          }
        },
        select: { id: true }
      })

      const workoutIds = oldWorkouts.map((w) => w.id)

      if (workoutIds.length > 0) {
        logger.log(
          `Found ${workoutIds.length} workouts older than 12 months. Proceeding to prune streams and FIT files.`
        )

        // Delete streams for these workouts
        const streamsDeleted = await prisma.workoutStream.deleteMany({
          where: { workoutId: { in: workoutIds } }
        })

        const streamsV2Deleted = await prisma.workoutStreamV2.deleteMany({
          where: { workoutId: { in: workoutIds } }
        })

        // Delete raw FIT files for these workouts
        const fitFilesDeleted = await prisma.fitFile.deleteMany({
          where: { workoutId: { in: workoutIds } }
        })

        // We deliberately KEEP the Workout record itself so the calendar and high-level
        // analytics continue to function instantaneously for long-term historical data.

        logger.log('Pruning complete', {
          streamsDeleted: streamsDeleted.count,
          streamsV2Deleted: streamsV2Deleted.count,
          fitFilesDeleted: fitFilesDeleted.count
        })
      } else {
        logger.log('No data older than 12 months to prune.')
      }

      // Also clean up any orphaned FitFiles older than 12 months
      const orphanedFitFiles = await prisma.fitFile.deleteMany({
        where: {
          workoutId: null,
          createdAt: {
            lt: twelveMonthsAgo
          }
        }
      })

      if (orphanedFitFiles.count > 0) {
        logger.log(`Deleted ${orphanedFitFiles.count} orphaned FitFiles.`)
      }
    } catch (error) {
      logger.error('Error during data pruning', { error })
      throw error
    }
  }
})
