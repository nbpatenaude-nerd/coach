import { getServerSession } from '../../../../utils/session'
import { prisma } from '../../../../utils/db'
import { assertPlannedWorkoutAccess } from '../../../../utils/coaching-auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const viewerId = session?.user?.id

  if (!viewerId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Workout ID is required' })
  }

  const workout = await prisma.plannedWorkout.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      date: true
    }
  })

  if (!workout) {
    throw createError({ statusCode: 404, message: 'Planned workout not found' })
  }
  await assertPlannedWorkoutAccess(viewerId, workout.userId)
  const userId = workout.userId

  const select = {
    id: true,
    title: true,
    date: true,
    type: true
  } as const

  const [previous, next] = await Promise.all([
    prisma.plannedWorkout.findFirst({
      where: {
        userId,
        OR: [
          { date: { lt: workout.date } },
          {
            AND: [{ date: workout.date }, { id: { lt: workout.id } }]
          }
        ]
      },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      select
    }),
    prisma.plannedWorkout.findFirst({
      where: {
        userId,
        OR: [
          { date: { gt: workout.date } },
          {
            AND: [{ date: workout.date }, { id: { gt: workout.id } }]
          }
        ]
      },
      orderBy: [{ date: 'asc' }, { id: 'asc' }],
      select
    })
  ])

  return { previous, next }
})
