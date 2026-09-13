import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { PrismaClient } from '../server/utils/generated-prisma/client/index.js'

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const coachEmail = process.argv[2]
  const athleteEmail = process.argv[3]

  if (!coachEmail || !athleteEmail) {
    console.error('Usage: npx tsx scripts/fix-accounts.ts <coach_email> <athlete_email>')
    process.exit(1)
  }

  console.log(`Setting ${coachEmail} to ADMIN...`)
  await prisma.user.updateMany({
    where: { email: coachEmail },
    data: { role: 'ADMIN' }
  })
  console.log(`Done.`)

  console.log(`Setting ${athleteEmail} to UNLOCK...`)
  await prisma.user.updateMany({
    where: { email: athleteEmail },
    data: { role: 'UNLOCK' }
  })
  console.log(`Done.`)

  await prisma.$disconnect()
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
