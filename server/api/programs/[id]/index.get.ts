import { prisma } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const program = await prisma.user.findUnique({
    where: { id, isProgramAccount: true },
    select: { id: true, name: true, image: true, _count: { select: { athletes: true } } }
  })

  if (!program) throw createError({ statusCode: 404, message: 'Program not found' })

  return {
    id: program.id,
    name: program.name,
    image: program.image,
    subscriberCount: program._count.athletes
  }
})
