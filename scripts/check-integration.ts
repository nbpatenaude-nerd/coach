import { prisma } from '../server/utils/db'
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'n.b.patenaude@gmail.com' } })
  if (!user) return console.log('User not found')
  const ints = await prisma.integration.findMany({ where: { userId: user.id } })
  console.log('Integrations:', ints)
}
main()
