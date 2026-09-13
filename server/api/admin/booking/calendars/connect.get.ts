import { getAuthUrl } from '~/server/utils/googleCalendar'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401 })

  const url = getAuthUrl(session.user.id)
  return sendRedirect(event, url)
})
