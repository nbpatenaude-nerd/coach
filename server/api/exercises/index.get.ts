import { z } from 'zod/v3'
import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = (query.search as string) || ''

  const exercises = await (prisma as any).exercise.findMany({
    where: search
      ? {
          title: { contains: search, mode: 'insensitive' }
        }
      : undefined,
    orderBy: { title: 'asc' }
  })

  return exercises
})
