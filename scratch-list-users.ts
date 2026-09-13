import pkg from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
const { PrismaClient } = pkg

async function main() {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://watts:password@localhost:5432/watts'
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const users = await prisma.user.findMany()
  console.log(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      plan: u.subscriptionPlan,
      status: u.subscriptionStatus
    }))
  )

  await prisma.$disconnect()
  await pool.end()
}

main().catch(console.error)
