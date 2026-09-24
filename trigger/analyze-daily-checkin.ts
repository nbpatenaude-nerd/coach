import './init'
import { logger, task } from '@trigger.dev/sdk/v3'
import { userAnalysisQueue } from './queues'
import { analyzeDailyCheckin } from '../server/utils/services/daily-checkin-analysis'

export const analyzeDailyCheckinTask = task({
  id: 'analyze-daily-checkin',
  queue: userAnalysisQueue,
  maxDuration: 300,
  run: async (payload: { checkinId: string; userId: string }) => {
    logger.log('Starting daily check-in analysis via Trigger.dev', {
      userId: payload.userId,
      checkinId: payload.checkinId
    })
    return await analyzeDailyCheckin(payload.checkinId, payload.userId)
  }
})
