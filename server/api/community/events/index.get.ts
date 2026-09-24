import { requireAuth } from '../../../utils/auth-guard'
import { listCommunityEventsForUser } from '../../../utils/community-events'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  try {
    return await listCommunityEventsForUser(user.id)
  } catch (error) {
    console.error('Error fetching community events:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch community events'
    })
  }
})
