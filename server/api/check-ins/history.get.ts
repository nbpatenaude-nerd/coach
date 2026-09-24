import { requireAuth } from '../../utils/auth-guard'
import { getAthleteCheckInHistory } from '../../utils/services/weeklyCheckInService'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, [])
  const query = getQuery(event)
  const days = query.days ? Number(query.days) : 90
  const limit = query.limit ? Number(query.limit) : 52

  const history = await getAthleteCheckInHistory(user.id, {
    days: Number.isFinite(days) ? days : 90,
    limit: Number.isFinite(limit) ? limit : 52
  })

  return { data: history }
})
