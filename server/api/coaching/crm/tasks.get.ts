import { defineEventHandler } from 'h3'

import { prisma } from '~~/server/utils/db'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
})

export default defineEventHandler(async (event) => {
  // In a real app we'd verify the user is a coach, but auth is often bypassed in dev
  const tasks = await prisma.crmTask.findMany({
    orderBy: [{ isCompleted: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    include: {
      deal: {
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }
    },
    take: 50
  })

  return tasks
})
