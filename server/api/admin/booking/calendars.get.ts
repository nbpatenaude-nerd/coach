import { prisma } from '../../../utils/db'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!(session?.user as any)?.id) throw createError({ statusCode: 401 })

  const accounts = await prisma.coachCalendarAccount.findMany({
    where: { userId: (session.user as any).id, isActive: true },
    select: { id: true, googleEmail: true, accountLabel: true, createdAt: true, expiresAt: true },
    orderBy: { createdAt: 'asc' }
  })

  return { accounts }
})
