import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  // Update Nick's accounts
  const athlete = await prisma.user.update({
    where: { email: 'n.b.patenaude@gmail.com' },
    data: { subscriptionStatus: 'ACTIVE', role: 'UNCOVER', isAdmin: false }
  })

  const coach = await prisma.user.update({
    where: { email: 'info@trinerds.com' },
    data: { role: 'ADMIN', isAdmin: true, isCoach: true, subscriptionStatus: 'ACTIVE' }
  })

  return { athlete, coach }
})
