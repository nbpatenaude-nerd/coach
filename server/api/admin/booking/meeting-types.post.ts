import { prisma } from '~/server/utils/db'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user?.id) throw createError({ statusCode: 401 })
  const body = await readBody(event)
  const { name, slug, description, durationMins, bufferMins, leadTimeHours, conferenceUrl, color } =
    body
  if (!name || !slug || !durationMins) throw createError({ statusCode: 400 })
  const meetingType = await prisma.meetingType.create({
    data: {
      userId: session.user.id,
      name,
      slug,
      description,
      durationMins: Number(durationMins),
      bufferMins: Number(bufferMins ?? 15),
      leadTimeHours: Number(leadTimeHours ?? 24),
      conferenceUrl,
      color
    }
  })
  return { meetingType }
})
