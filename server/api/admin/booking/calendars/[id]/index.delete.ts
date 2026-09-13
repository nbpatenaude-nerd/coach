import { prisma } from '~/server/utils/db'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401 })
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400 })
  const account = await prisma.coachCalendarAccount.findFirst({
    where: { id, userId: session.user.id }
  })
  if (!account) throw createError({ statusCode: 404 })
  await prisma.coachCalendarAccount.update({ where: { id }, data: { isActive: false } })
  return { success: true }
})
