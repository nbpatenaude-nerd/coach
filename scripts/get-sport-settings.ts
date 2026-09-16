import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from '@prisma/client'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
async function run() {
  const user = await prisma.user.findFirst()
  const settings = await prisma.sportSettings.findFirst({ where: { userId: user.id } })
  console.log(JSON.stringify(settings, null, 2))
  process.exit(0)
}
run()
