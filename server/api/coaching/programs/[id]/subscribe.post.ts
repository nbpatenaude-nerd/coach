import { requireAuth } from '../../../../utils/auth-guard'
import { prisma } from '../../../../utils/db'
import { z } from 'zod/v3'
import { dispatchTask } from '../../../../utils/task-dispatcher'

export default defineEventHandler(async (event) => {
  // An athlete is subscribing to a program
  const user = await requireAuth(event)
  const programId = getRouterParam(event, 'id')

  if (!programId) {
    throw createError({ statusCode: 400, message: 'Missing program ID' })
  }

  // Verify program exists
  const program = await prisma.user.findUnique({
    where: { id: programId, isProgramAccount: true }
  })

  if (!program) {
    throw createError({ statusCode: 404, message: 'Program not found' })
  }

  // Check if already subscribed
  const existing = await prisma.coachingRelationship.findFirst({
    where: {
      coachId: programId,
      athleteId: user.id
    }
  })

  if (!existing) {
    // Create subscription relationship (Program acts as coach, User acts as athlete)
    await prisma.coachingRelationship.create({
      data: {
        coachId: programId,
        athleteId: user.id,
        status: 'ACTIVE'
      }
    })
  } else if (existing.status !== 'ACTIVE') {
    await prisma.coachingRelationship.update({
      where: { id: existing.id },
      data: { status: 'ACTIVE' }
    })
  }

  // Trigger fan-out task to backfill future program workouts to this new subscriber
  await dispatchTask('fanout-program-workout', {
    programId,
    targetAthleteId: user.id,
    mode: 'INITIAL_SYNC'
  })

  return { success: true }
})
