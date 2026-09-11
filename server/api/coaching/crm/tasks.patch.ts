import { defineEventHandler, readBody } from 'h3'

import { prisma } from '~~/server/utils/db'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.id) {
    throw createError({ statusCode: 400, message: 'Task ID is required' })
  }

  const task = await prisma.crmTask.update({
    where: { id: body.id },
    data: {
      isCompleted: body.isCompleted,
      title: body.title,
      description: body.description,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined
    }
  })

  return task
})
