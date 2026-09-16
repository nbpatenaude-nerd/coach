import 'dotenv/config'
import { prisma } from './server/utils/db'

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, isAdmin: true, isCoach: true }
  })
  console.log(users)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
