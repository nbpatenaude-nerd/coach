import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const templates = await prisma.workoutTemplate.findMany({
    where: {
      title: { contains: 'Upper Body B: Power Transfer' }
    }
  })
  
  if (templates.length > 0) {
      console.log(JSON.stringify(templates[0], null, 2))
  } else {
      const folders = await prisma.workoutTemplateFolder.findMany({
          where: { name: { contains: '12-Week' } },
          include: { templates: true }
      })
      console.log(JSON.stringify(folders, null, 2))
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.())
