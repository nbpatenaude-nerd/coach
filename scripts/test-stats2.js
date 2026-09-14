import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function run() {
  const tier = 'FREE';
  const op = 'chat';
  const def = { limit: 20, window: '4 hours' };
  const threshold = Math.max(1, Math.floor(def.limit * 0.8))
  
  const res = await prisma.\\
    SELECT u.id
    FROM "User" u
    JOIN "LlmUsage" l ON l."userId" = u.id
    WHERE u."subscriptionTier"::text = \
      AND l.operation = \
      AND l.success = true
      AND l."createdAt" >= NOW() - CAST(\ AS interval)
    GROUP BY u.id
    HAVING COUNT(l.id) >= \
  \
  console.log(res)
}
run().catch(console.error).finally(() => prisma.\())
