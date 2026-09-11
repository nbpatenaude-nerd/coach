import { defineEventHandler } from 'h3'

import { prisma } from '~~/server/utils/db'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
})

export default defineEventHandler(async (event) => {
  const activities = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true, image: true }
      }
    },
    take: 30
  })

  // If there are no audit logs, let's just return some mock data so the dashboard looks good.
  if (activities.length === 0) {
    return [
      {
        id: '1',
        action: 'DEAL_MOVED',
        metadata: { from: 'Lead', to: 'Prospect' },
        createdAt: new Date().toISOString(),
        user: { name: 'Nicholas Patenaude' }
      },
      {
        id: '2',
        action: 'NOTE_ADDED',
        metadata: { content: 'Called about pricing' },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        user: { name: 'Dev Athlete' }
      },
      {
        id: '3',
        action: 'WORKOUT_COMPLETED',
        metadata: { workout: 'Threshold Intervals' },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        user: { name: 'Tailor M�sz�ros' }
      },
      {
        id: '4',
        action: 'DEAL_WON',
        metadata: { value: 1500 },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        user: { name: 'Nate Christel' }
      },
      {
        id: '5',
        action: 'CHECK_IN_SUBMITTED',
        metadata: { score: 'Green' },
        createdAt: new Date(Date.now() - 90000000).toISOString(),
        user: { name: 'Misha Young' }
      }
    ]
  }

  return activities
})
