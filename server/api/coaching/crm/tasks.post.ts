import { defineEventHandler, readBody } from 'h3'

import { prisma } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.title) {
    throw createError({ statusCode: 400, message: 'Title is required' })
  }

  const task = await prisma.crmTask.create({
    data: {
      title: body.title,
      description: body.description,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      dealId: body.dealId,
      userId: body.userId
    }
  })

  return task
})
