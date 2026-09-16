import { prisma } from './server/utils/db'

async function main() {
  const u1 = await prisma.user.findUnique({
    where: { email: 'n.b.patenaude@gmail.com' },
    select: {
      role: true,
      isAdmin: true,
      subscriptionStatus: true,
      subscriptionPeriodEnd: true,
      trialEndsAt: true
    }
  })
  console.log('n.b.patenaude@gmail.com:', u1)

  const u2 = await prisma.user.findUnique({
    where: { email: 'info@trinerds.com' },
    select: {
      role: true,
      isAdmin: true,
      subscriptionStatus: true,
      subscriptionPeriodEnd: true,
      trialEndsAt: true
    }
  })
  console.log('info@trinerds.com:', u2)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
