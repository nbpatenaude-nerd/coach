import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { z } from 'zod'
import { getServerSession } from '../../../../utils/session'
import { prisma } from '../../../../utils/db'
import { auditLogRepository } from '../../../../utils/repositories/auditLogRepository'

const rolesSchema = z.object({
  isAdmin: z.boolean().optional(),
  isCoach: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const userId = getRouterParam(event, 'id')
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User ID required' })
  }

  // A user shouldn't remove their own admin access via this endpoint
  const sessionUser = session.user as any
  const actorId = sessionUser?.originalUserId || sessionUser?.id
  if (actorId === userId) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot modify your own roles here' })
  }

  const body = await readBody(event)
  const parsed = rolesSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input' })
  }

  const { isAdmin, isCoach } = parsed.data

  const dataToUpdate: any = {}
  if (isAdmin !== undefined) dataToUpdate.isAdmin = isAdmin
  if (isCoach !== undefined) dataToUpdate.isCoach = isCoach

  if (Object.keys(dataToUpdate).length === 0) {
    return { success: true }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate
  })

  await auditLogRepository.log({
    userId,
    action: 'ADMIN_UPDATE_USER_ROLES',
    resourceType: 'USER',
    resourceId: userId,
    metadata: {
      isAdmin: user.isAdmin,
      isCoach: user.isCoach,
      actorId
    }
  })

  return {
    success: true,
    user: {
      id: user.id,
      isAdmin: user.isAdmin,
      isCoach: user.isCoach
    }
  }
})
