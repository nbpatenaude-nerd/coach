import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const email = query.email as string
  const role = (query.role as string) || 'ADMIN'
  const secret = query.secret as string

  if (secret !== 'coachwatts2026') {
    return { error: 'Unauthorized' }
  }

  if (!email) {
    return { error: 'Provide ?email=your@email.com' }
  }

  await prisma.user.updateMany({
    where: { email },
    data: { role, isCoach: role === 'ADMIN' }
  })

  return { success: true, message: `Elevated ${email} to ${role}` }
})
