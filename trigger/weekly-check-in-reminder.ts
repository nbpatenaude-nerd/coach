import { task, logger } from '@trigger.dev/sdk/v3'
import { createUserNotification } from '../server/utils/notifications'
import { dispatchTask } from '../server/utils/task-dispatcher'
import {
  checkInReminderCopy,
  findAthletesNeedingCheckInReminder
} from '../server/utils/services/weeklyCheckInReminderService'

// Scheduling is owned by cw:worker via task-manifest.json (not Trigger.dev Cloud
// declarative cron) — same pattern as trial-ending-reminder-cron.
export const weeklyCheckInReminderCron = task({
  id: 'weekly-check-in-reminder-cron',
  run: async () => {
    const now = new Date()
    const candidates = await findAthletesNeedingCheckInReminder(now)

    logger.log('Weekly check-in reminder candidates', {
      count: candidates.length,
      at: now.toISOString()
    })

    const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://journeyendurance.com'
    let notifiedCount = 0
    let emailedCount = 0
    let failedCount = 0

    for (const candidate of candidates) {
      const copy = checkInReminderCopy(candidate.localWeekday)
      const dayLabel = candidate.localWeekday === 1 ? 'mon' : 'tue'

      try {
        await createUserNotification(candidate.userId, {
          title: copy.title,
          message: copy.message,
          icon: 'i-lucide-clipboard-check',
          link: '/dashboard'
        })
        notifiedCount++
      } catch (error) {
        failedCount++
        logger.error('Failed to create check-in in-app notification', {
          userId: candidate.userId,
          error
        })
        // Still attempt email below.
      }

      if (!candidate.email) continue

      try {
        await dispatchTask('send-email', {
          userId: candidate.userId,
          templateKey: 'WeeklyCheckInReminder',
          eventKey: `WEEKLY_CHECK_IN_REMINDER_${candidate.weekKey}_${dayLabel}`,
          idempotencyKey: `weekly-check-in-reminder:${candidate.userId}:${candidate.weekKey}:${dayLabel}`,
          audience: 'ENGAGEMENT',
          subject: copy.emailSubject,
          props: {
            name: candidate.name || 'Athlete',
            dayLabel: candidate.localWeekday === 1 ? 'Monday' : 'Tuesday',
            deadlineHint: 'before Wednesday morning',
            checkInUrl: `${siteUrl}/dashboard`
          }
        })
        emailedCount++
      } catch (error) {
        failedCount++
        logger.error('Failed to dispatch check-in reminder email', {
          userId: candidate.userId,
          error
        })
      }
    }

    if (failedCount > 0) {
      logger.warn('Weekly check-in reminder cron completed with partial failures', {
        count: candidates.length,
        notifiedCount,
        emailedCount,
        failedCount
      })
    }

    return {
      success: failedCount === 0,
      count: candidates.length,
      notifiedCount,
      emailedCount,
      failedCount
    }
  }
})
