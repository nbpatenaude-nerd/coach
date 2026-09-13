import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!(session?.user as any)?.id) throw createError({ statusCode: 401 })

  const url = getAuthUrl((session.user as any).id)
  return sendRedirect(event, url)
})
