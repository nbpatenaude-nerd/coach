import { requireAuth } from '~~/server/utils/auth-guard'
import { prisma } from '~~/server/utils/db'
import { PrismaClient } from '~~/server/utils/generated-prisma/client'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (!user.id) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const goalId = getRouterParam(event, 'id')
  if (!goalId) throw createError({ statusCode: 400, message: 'Missing goal ID' })

  const body = await readBody(event)
  const { completionLevel, completionNotes } = body

  

  // Verify goal exists and belongs to user
  const goal = await prisma.goal.findUnique({
    where: { id: goalId, userId: user.id }
  })
  if (!goal) {
    throw createError({ statusCode: 404, message: 'Goal not found' })
  }

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: {
      status: 'COMPLETED',
      completionLevel,
      completionNotes
    }
  })

  return updated
})
