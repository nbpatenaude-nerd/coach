import { prisma } from '~/server/utils/db'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401 })
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400 })
  const booking = await prisma.booking.findFirst({ where: { id, coachUserId: session.user.id } })
  if (!booking) throw createError({ statusCode: 404 })
  await prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' } })
  return { success: true }
})
