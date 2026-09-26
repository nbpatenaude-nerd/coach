import { prisma } from '../../../../utils/db'
import { dispatchTask } from '../../../../utils/task-dispatcher'
import { z } from 'zod/v3'
import { getServerSession } from '../../../../utils/session'
import { publishTaskRunStartedEvent } from '../../../../utils/task-run-events'
import { structureGenerationRunTags } from '../../../../utils/trigger-run-tags'
import { assertPlannedWorkoutAccess } from '../../../../utils/coaching-auth'

const messageRequestSchema = z.object({
  tone: z.string().optional(),
  context: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const viewerId = (session.user as any).id
  const workoutId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { tone, context } = messageRequestSchema.parse(body)

  const workout = await prisma.plannedWorkout.findFirst({
    where: { id: workoutId }
  })

  if (!workout) {
    throw createError({ statusCode: 404, message: 'Workout not found' })
  }

  await assertPlannedWorkoutAccess(viewerId, workout.userId)

  const userId = workout.userId
  const tags = structureGenerationRunTags({
    userId,
    plannedWorkoutId: workout.id,
    source: 'api'
  })
  const handle = await dispatchTask(
    'generate-workout-messages',
    {
      plannedWorkoutId: workout.id,
      tone,
      context
    },
    {
      tags
    }
  )

  await publishTaskRunStartedEvent(userId, 'generate-workout-messages', handle, { tags })

  return { success: true, jobId: handle.id }
})
