import 'dotenv/config'
import { prisma } from './server/utils/db'

async function main() {
  const c = await prisma.strengthExerciseLibraryItem.count();
  console.log('Total library items:', c);
  const items = await prisma.strengthExerciseLibraryItem.findMany({ take: 10 });
  console.log('Sample Items:', items.map(i => i.title));
  
  const t = await prisma.workoutTemplate.count({ where: { tags: { has: 'Endurance Strength' } } });
  console.log('Total endurance strength templates:', t);
}

main().catch(console.error).finally(() => prisma.$disconnect());
