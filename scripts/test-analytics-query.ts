import { analyticsRepository } from '../server/utils/repositories/analyticsRepository'
import { prisma } from '../server/utils/db'

async function main() {
  const user = await prisma.user.findFirst()
  if (!user) return

  const options = {
    source: 'wellness',
    grouping: 'daily',
    timeRange: { startDate: new Date('2026-07-26'), endDate: new Date('2026-08-26') },
    scope: { target: 'self' },
    metrics: [
      { field: 'restingHr', aggregation: 'avg' },
      { field: 'hrv', aggregation: 'avg' }
    ]
  }

  try {
    const result = await analyticsRepository.query(user.id, options as any)
    console.log(result)
  } catch (e) {
    console.error(e)
  }
}

main()
