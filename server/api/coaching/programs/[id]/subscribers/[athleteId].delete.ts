import { requireAuth } from '../../../../../utils/auth-guard'
import { prisma } from '../../../../../utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['coaching:write'])
  const programId = getRouterParam(event, 'id')
  const athleteId = getRouterParam(event, 'athleteId')

  if (!programId || !athleteId) {
    throw createError({ statusCode: 400, message: 'Missing program ID or athlete ID' })
  }

  // Verify this user owns the program
  const program = await prisma.user.findFirst({
    where: { id: programId, isProgramAccount: true, programOwnerId: user.id }
  })

  if (!program) throw createError({ statusCode: 403, message: 'Not authorized' })

  // Remove subscription
  await prisma.coachingRelationship.deleteMany({
    where: { coachId: programId, athleteId }
  })

  // Delete all cloned workouts for this athlete
  await prisma.plannedWorkout.deleteMany({
    where: {
      userId: athleteId,
      externalId: { startsWith: `program_${programId}_workout_` }
    }
  })

  return { success: true }
})
