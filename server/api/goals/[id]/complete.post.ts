import { PrismaClient } from '~/server/utils/generated-prisma/client'

export default defineEventHandler(async (event) => {
  const session = await requireAuthSession(event)
  if (!session.user?.id) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const goalId = getRouterParam(event, 'id')
  if (!goalId) throw createError({ statusCode: 400, message: 'Missing goal ID' })

  const body = await readBody(event)
  const { completionLevel, completionNotes } = body

  const db = await getPrisma()

  // Verify goal exists and belongs to user
  const goal = await db.goal.findUnique({
    where: { id: goalId, userId: session.user.id }
  })
  if (!goal) {
    throw createError({ statusCode: 404, message: 'Goal not found' })
  }

  const updated = await db.goal.update({
    where: { id: goalId },
    data: {
      status: 'COMPLETED',
      completionLevel,
      completionNotes
    }
  })

  return updated
})
