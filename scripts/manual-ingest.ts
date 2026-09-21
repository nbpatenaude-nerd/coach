import 'dotenv/config'
import { prisma } from '../server/utils/db.js'
import { IntervalsService } from '../server/utils/services/intervalsService.js'

async function run() {
  const email = 'n.b.patenaude@gmail.com'
  console.log(`Fetching user ${email}...`);
  const user = await prisma.user.findUnique({
    where: { email },
    include: { integrations: true }
  })
  
  if (!user) throw new Error('User not found')
  const integration = user.integrations.find(i => i.provider === 'intervals')
  if (!integration) throw new Error('Intervals integration not found')

  console.log('Fetching intervals data...');
  // 90 days ago
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  const events = await IntervalsService.syncActivities(user.id, startDate, endDate);
  console.log(`Synced intervals activities.`);

  const wellness = await IntervalsService.syncWellness(user.id, startDate, endDate);
  console.log(`Synced intervals wellness.`);
  
  const planned = await IntervalsService.syncPlannedWorkouts(user.id, startDate, endDate);
  console.log(`Synced planned workouts.`);
  console.log('Done!');
}

run().catch(console.error).finally(() => process.exit(0));
