import { z } from 'zod/v3'
import { prisma } from '../../utils/db'
import { getServerSession } from '../../utils/session'

const schema = z.object({
  title: z.string().min(1),
  type: z.string().optional(),
  primaryMuscle: z.string().optional(),
  secondaryMuscles: z.array(z.string()).optional(),
  instructions: z.string().optional(),
  imageUrl: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)
  const validation = schema.safeParse(body)
  if (!validation.success) {
    throw createError({ statusCode: 400, message: validation.error.message })
  }

  const data = validation.data
  const exercise = await (prisma as any).exercise.create({
    data: {
      title: data.title,
      type: data.type,
      primaryMuscle: data.primaryMuscle,
      secondaryMuscles: data.secondaryMuscles || [],
      instructions: data.instructions,
      imageUrl: data.imageUrl
    }
  })

  return exercise
})
