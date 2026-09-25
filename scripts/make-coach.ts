import { prisma } from '../server/utils/db'

/**
 * Grant in-app coaching privileges to a user by email.
 *
 *   pnpm exec tsx scripts/make-coach.ts coach@example.com
 *
 * After running, the user must re-login (or refresh session) so Auth.js
 * session.user.isCoach is populated.
 */
async function main() {
  const email = process.argv[2]?.trim().toLowerCase()
  if (!email) {
    console.error('Usage: pnpm exec tsx scripts/make-coach.ts <email>')
    process.exit(1)
  }

  const user = await prisma.user.update({
    where: { email },
    data: { isCoach: true },
    select: { id: true, email: true, name: true, isCoach: true }
  })

  console.log(`Granted isCoach=true to ${user.email} (${user.id}). Re-login required for session.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
