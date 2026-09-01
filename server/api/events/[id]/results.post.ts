import { requireAuth } from '~~/server/utils/auth-guard'
import { prisma } from '~~/server/utils/db'
import { PrismaClient } from '~~/server/utils/generated-prisma/client'
import { sendTelegramMessage } from '~~/server/utils/telegram'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (!user.id) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const eventId = getRouterParam(event, 'id')
  if (!eventId) throw createError({ statusCode: 400, message: 'Missing event ID' })

  const body = await readBody(event)
  const { resultTime, resultPosition, raceReport, photoUrl } = body

  

  // verify the user is participating
  const participant = await prisma.eventParticipant.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
    include: { event: true, user: true }
  })
  if (!participant) {
    throw createError({ statusCode: 403, message: 'Must be RSVPed to post results' })
  }

  const updated = await prisma.eventParticipant.update({
    where: { id: participant.id },
    data: {
      isCompleted: true,
      resultTime: resultTime ? parseInt(resultTime) : null,
      resultPosition: resultPosition ? parseInt(resultPosition) : null,
      raceReport,
      photoUrl
    }
  })

  // Trigger Telegram Bot
  const msg = `🎉 <b>New Race Result!</b> 🎉\n<b>Athlete:</b> ${participant.user.name}\n<b>Event:</b> ${participant.event.title}\n<b>Position:</b> ${resultPosition || 'N/A'} | <b>Time:</b> ${resultTime ? Math.floor(resultTime / 3600) + 'h ' + Math.floor((resultTime % 3600) / 60) + 'm' : 'N/A'}\n<b>Report:</b> ${raceReport || 'No report provided.'}`

  // Await the send so we know if it succeeded, but we won't fail the request if it fails
  try {
    await sendTelegramMessage(msg)
  } catch (e) {
    console.error('Failed to send telegram message for results', e)
  }

  return updated
})
