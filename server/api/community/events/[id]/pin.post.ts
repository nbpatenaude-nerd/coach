import { z } from 'zod'
import { requireAuth } from '../../../../utils/auth-guard'
import { setTeamEventPinned } from '../../../../utils/community-events'

/** Coach/admin pin or unpin a Team Calendar event. */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Event ID is required' })
  }

  const body = await readValidatedBody(event, z.object({ pinned: z.boolean() }).parse)

  const updated = await setTeamEventPinned(user, id, body.pinned)
  return {
    id: updated.id,
    isPinned: updated.isPinned,
    pinnedAt: updated.pinnedAt?.toISOString() ?? null
  }
})
