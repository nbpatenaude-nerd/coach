import { z } from 'zod/v3'
import { requireAuth } from '../../../../utils/auth-guard'
import { teamRepository } from '../../../../utils/repositories/teamRepository'
import { coachingRepository } from '../../../../utils/repositories/coachingRepository'

const addMemberSchema = z.object({
  // Legacy Firebase localIds are not RFC UUIDs — accept any non-empty user id.
  athleteId: z.preprocess(
    (value) => {
      if (typeof value === 'string') return value.trim()
      if (typeof value === 'number') return String(value)
      if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>
        for (const key of ['value', 'id', 'athleteId']) {
          const candidate = record[key]
          if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
          if (typeof candidate === 'number') return String(candidate)
        }
      }
      return value
    },
    z.string().min(1, 'athleteId is required')
  )
})

defineRouteMeta({
  openAPI: {
    tags: ['Coaching', 'Groups'],
    summary: 'Add athlete to group',
    description: 'Adds an athlete to a specific athlete group.',
    inputSchema: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' }
      }
    ],
    responses: {
      201: { description: 'Added' },
      400: { description: 'Invalid input' },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      404: { description: 'Group or Athlete not found' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['coaching:write'])
  const groupId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const result = addMemberSchema.safeParse(body)

  if (!groupId) {
    throw createError({ statusCode: 400, message: 'Group ID is required' })
  }

  if (!result.success) {
    const issue = result.error.issues[0]
    throw createError({
      statusCode: 400,
      message: issue?.message || 'Invalid athlete selection',
      data: result.error.flatten()
    })
  }

  const { athleteId } = result.data
  const group = await teamRepository.getGroupDetails(groupId)

  if (!group) {
    throw createError({ statusCode: 404, message: 'Group not found' })
  }

  // Permission: Must be group owner or team coach
  if (group.teamId) {
    const hasAccess = await teamRepository.checkTeamAccess(group.teamId, user.id, [
      'OWNER',
      'ADMIN',
      'COACH'
    ])
    if (!hasAccess) {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions for this team group'
      })
    }
  } else {
    if (group.coachId !== user.id) {
      throw createError({ statusCode: 403, message: 'You do not own this group' })
    }
  }

  // Security: Check if coach has a relationship with this athlete (standard requirement)
  // unless they are in the same team (we can loosen this later if needed)
  const isCoached = await coachingRepository.checkRelationship(user.id, athleteId)
  if (!isCoached) {
    // Check if team-based relationship exists
    if (group.teamId) {
      const athleteInTeam = await teamRepository.checkTeamAccess(group.teamId, athleteId)
      if (!athleteInTeam) {
        throw createError({
          statusCode: 403,
          message: 'Athlete must be coached by you or be in the same team'
        })
      }
    } else {
      throw createError({
        statusCode: 403,
        message: 'You can only add athletes you are coaching to private groups'
      })
    }
  }

  const membership = await teamRepository.addAthleteToGroup(groupId, athleteId)

  setResponseStatus(event, 201)
  return membership
})
