import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../../../utils/auth-guard'
import { prisma } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  if (!body.token) throw new Error('Missing token')

  await prisma.integration.upsert({
    where: { userId_provider: { userId: user.id, provider: 'journey_strength' } },
    update: { accessToken: body.token },
    create: { userId: user.id, provider: 'journey_strength', accessToken: body.token }
  })

  return { success: true }
})
