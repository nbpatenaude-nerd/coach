const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const { PrismaClient } = require('@prisma/client')
const pool = new Pool({ connectionString: 'postgresql://watts:password@localhost:5432/watts' })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
async function main() {
  console.log('Users:', await prisma.user.count())
  console.log('Rels:', await prisma.coachingRelationship.count({ where: { status: 'ACTIVE' } }))
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
