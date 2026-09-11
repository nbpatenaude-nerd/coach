import { requireAuth } from '../../../utils/auth-guard'
import { prisma } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['coaching:read'])

  const programs = await prisma.user.findMany({
    where: {
      isProgramAccount: true,
      OR: [
        { programOwnerId: user.id },
        {
          coaches: {
            some: {
              coachId: user.id,
              status: 'ACTIVE'
            }
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
        select: { id: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return programs.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.image,
    createdAt: p.createdAt,
    programOwnerId: p.programOwnerId,
    subscriberCount: p.athletes.length
  }))
})
