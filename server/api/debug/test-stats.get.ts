import { defineEventHandler } from 'h3'
import { prisma } from '../../utils/db'
import { QUOTA_REGISTRY } from '../../utils/quotas/registry'

export default defineEventHandler(async () => {
  const tier = 'FREE';
  const op = 'chat';
  const def = QUOTA_REGISTRY.FREE.chat;
  const threshold = Math.max(1, Math.floor(def!.limit * 0.8))
  
  const res = await prisma.\<any[]>\
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
  return res
})
