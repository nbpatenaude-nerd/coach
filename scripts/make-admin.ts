import { prisma } from '../server/utils/db'

async function main() {
  await prisma.user.update({
    where: { email: 'info@trinerds.com' },
    data: { isAdmin: true, isCoach: true }
  })
  console.log('User info@trinerds.com has been granted admin and coach rights.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
