import { requireAuth } from '../../utils/auth-guard'
import { getCurrentWeeklyCheckIn } from '../../utils/services/weeklyCheckInService'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, [])
  return getCurrentWeeklyCheckIn(user.id)
})
