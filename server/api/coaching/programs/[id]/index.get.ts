import { requireAuth } from '../../../../utils/auth-guard'
import { prisma } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['coaching:read'])
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, message: 'Missing program ID' })

  const program = await prisma.user.findFirst({
    where: {
      id,
      isProgramAccount: true,
      OR: [
        { programOwnerId: user.id },
        {
          coaches: {
            some: { coachId: user.id, status: 'ACTIVE' }
          }
        }
      ]
    },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      programOwnerId: true,
      athletes: {
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          createdAt: true,
          athlete: {
            select: { id: true, name: true, email: true, image: true }
          }
        }
      }
    }
  })

  if (!program) throw createError({ statusCode: 404, message: 'Program not found' })

  const subscribers = program.athletes
    .filter((rel) => rel.athlete.id !== program.programOwnerId)
    .map((rel) => ({
      id: rel.athlete.id,
      name: rel.athlete.name,
      email: rel.athlete.email,
      image: rel.athlete.image,
      subscribedAt: rel.createdAt
    }))

  return {
    id: program.id,
    name: program.name,
    image: program.image,
    createdAt: program.createdAt,
    subscriberCount: subscribers.length,
    subscribers
  }
})
