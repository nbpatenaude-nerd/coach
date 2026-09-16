import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
const pool = new pg.Pool({ connectionString: 'postgresql://watts:password@localhost:5432/watts' })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
async function main() {
  console.log('Users:', await prisma.user.count())
  console.log('Relationships:', await prisma.coachingRelationship.count())
  console.log(
    'Active Rels:',
    await prisma.coachingRelationship.count({ where: { status: 'ACTIVE' } })
  )
}
main().finally(() => prisma.$disconnect())
