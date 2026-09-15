import { requireAuth } from '../../../../utils/auth-guard'
import { prisma } from '../../../../utils/db'
import { dispatchTask } from '../../../../utils/task-dispatcher'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['coaching:write'])
  const programId = getRouterParam(event, 'id')

  if (!programId) {
    throw createError({ statusCode: 400, message: 'Missing program ID' })
  }

  // Verify program exists and user has access
  const program = await prisma.user.findUnique({
    where: { id: programId, isProgramAccount: true }
  })

  if (!program || program.programOwnerId !== user.id) {
    throw createError({ statusCode: 403, message: 'Program not found or access denied' })
  }

  // Get all active subscribers
  const subscribers = await prisma.coachingRelationship.findMany({
    where: { coachId: programId, status: 'ACTIVE' },
    select: { athleteId: true }
  })

  // Trigger fanout initial sync for each subscriber
  // The 'INITIAL_SYNC' mode backfills the last 90 days and all future workouts.
  for (const sub of subscribers) {
    await dispatchTask('fanout-program-workout', {
      programId,
      targetAthleteId: sub.athleteId,
      mode: 'INITIAL_SYNC'
    })
  }

  return { success: true, count: subscribers.length }
})
