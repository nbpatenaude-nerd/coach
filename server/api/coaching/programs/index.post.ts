import { requireAuth } from '../../../utils/auth-guard'
import { prisma } from '../../../utils/db'
import { z } from 'zod/v3'

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['coaching:write'])
  const body = await readValidatedBody(event, schema.parse)

  // 1. Create the Virtual Athlete account
  const programAccount = await prisma.user.create({
    data: {
      name: body.name,
      email: `program_${Date.now()}@coachwattz.test`,
      isProgramAccount: true,
      programOwnerId: user.id,
      // Minimal defaults for a valid account
      timezone: user.timezone,
      language: user.language
    }
  })

  // 2. Add the creating coach to the program so they can act as it
  await prisma.coachingRelationship.create({
    data: {
      coachId: user.id,
      athleteId: programAccount.id,
      status: 'ACTIVE'
    }
  })

  return {
    success: true,
    programId: programAccount.id
  }
})
