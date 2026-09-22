import { z } from 'zod'
import { isAllowedCoachVideoUrl } from '../../../../../shared/check-in'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  if (!user.isCoach && !user.isAdmin && user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing check-in ID' })
  }

  const body = await readValidatedBody(
    event,
    z
      .object({
        /** Canonical notes field. */
        coachNotes: z.string().max(10000).optional(),
        /** Legacy alias accepted for older clients. */
        coachFeedback: z.string().max(10000).optional(),
        coachVideoUrl: z.string().max(2000).optional().nullable()
      })
      .refine(
        (b) =>
          b.coachNotes !== undefined ||
          b.coachFeedback !== undefined ||
          b.coachVideoUrl !== undefined,
        {
          message: 'Provide coachNotes, coachFeedback, and/or coachVideoUrl'
        }
      ).parse
  )

  const notes = (body.coachNotes ?? body.coachFeedback ?? '').trim()
  const videoUrl =
    body.coachVideoUrl === undefined || body.coachVideoUrl === null
      ? body.coachVideoUrl
      : body.coachVideoUrl.trim()

  if (videoUrl && !isAllowedCoachVideoUrl(videoUrl)) {
    throw createError({
      statusCode: 400,
      message: 'Video URL must be a https://komodo.ai or https://video.trinerds.com link'
    })
  }

  if (!notes && !videoUrl) {
    throw createError({
      statusCode: 400,
      message: 'Provide notes or a coach video URL'
    })
  }

  const checkIn = await prisma.weeklyCheckIn.findUnique({
    where: { id },
    select: { id: true, athleteId: true, coachVideoUrl: true }
  })

  if (!checkIn) {
    throw createError({ statusCode: 404, message: 'Check-in not found' })
  }

  const isAdmin = user.isAdmin || user.role === 'ADMIN'
  if (!isAdmin) {
    const relationship = await prisma.coachingRelationship.findFirst({
      where: {
        coachId: user.id,
        athleteId: checkIn.athleteId,
        status: 'ACTIVE'
      }
    })
    if (!relationship) {
      throw createError({
        statusCode: 403,
        message: 'Not authorized to reply to this athlete'
      })
    }
  }

  const videoChanged =
    videoUrl !== undefined && videoUrl !== null && videoUrl !== checkIn.coachVideoUrl

  const updated = await prisma.weeklyCheckIn.update({
    where: { id },
    data: {
      coachNotes: notes || null,
      // Keep shim column in sync for any older readers still selecting it.
      coachFeedback: notes || null,
      ...(videoUrl !== undefined
        ? {
            coachVideoUrl: videoUrl || null,
            ...(videoChanged || videoUrl === null
              ? { coachVideoAddedAt: videoUrl ? new Date() : null }
              : {})
          }
        : {}),
      coachId: user.id,
      coachReviewedAt: new Date(),
      status: 'REVIEWED'
    }
  })

  return {
    id: updated.id,
    athleteId: updated.athleteId,
    status: updated.status,
    coachNotes: updated.coachNotes,
    coachFeedback: updated.coachFeedback,
    coachVideoUrl: updated.coachVideoUrl,
    coachVideoAddedAt: updated.coachVideoAddedAt?.toISOString() ?? null,
    coachReviewedAt: updated.coachReviewedAt?.toISOString() ?? null,
    coachId: updated.coachId
  }
})
