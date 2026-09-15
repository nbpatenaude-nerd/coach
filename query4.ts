import 'dotenv/config'
import { prisma } from './server/utils/db'

async function main() {
  const templates = await prisma.workoutTemplate.findMany({
    where: { title: { contains: 'Kathryn', mode: 'insensitive' } },
    select: { title: true, sport: true, type: true, category: true, tags: true }
  })
  console.log('Kathryn templates:', templates)
  
  const genTemplates = await prisma.workoutTemplate.findMany({
    where: { tags: { has: 'Endurance Strength' } },
    select: { title: true, sport: true, type: true, category: true, tags: true },
    take: 2
  })
  console.log('Generated templates:', genTemplates)
}

main().catch(console.error).finally(() => prisma.$disconnect())
