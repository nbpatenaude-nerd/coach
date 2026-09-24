import {
  DEFAULT_CHECK_IN_FORM,
  formatCheckInResponsesForPrompt,
  listCheckInOutliers,
  type CheckInResponses,
  weekStartKey
} from '../../../../../shared/check-in'
import {
  buildCheckInDraftReplyUserPrompt,
  checkInDraftReplySystemPrompt
} from '../../../../utils/checkInDraftReplyPrompt'
import { generateCoachAnalysis } from '../../../../utils/gemini'
import { parseFormDefinition } from '../../../../utils/services/weeklyCheckInService'

/**
 * Generate AI draft coach notes for a weekly check-in.
 * Does NOT persist coachNotes or mark the check-in REVIEWED — coach must edit/send via reply.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  if (!user.isCoach && !user.isAdmin && user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing check-in ID' })
  }

  const checkIn = await prisma.weeklyCheckIn.findUnique({
    where: { id },
    include: {
      form: {
        select: { sections: true }
      },
      athlete: {
        select: { id: true, name: true }
      }
    }
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
        message: 'Not authorized to draft a reply for this athlete'
      })
    }
  }

  const form = checkIn.form ? parseFormDefinition(checkIn.form.sections) : DEFAULT_CHECK_IN_FORM
  const responses = (checkIn.responses ?? {}) as CheckInResponses
  const responsesBlock = formatCheckInResponsesForPrompt(form, responses)
  const outliers = listCheckInOutliers(form, responses)

  const athleteName = checkIn.athlete?.name?.trim() || 'the athlete'

  const userPrompt = buildCheckInDraftReplyUserPrompt({
    athleteName,
    weekStartDate: weekStartKey(checkIn.weekStartDate),
    responsesBlock,
    outliers
  })

  const prompt = `${checkInDraftReplySystemPrompt}

${userPrompt}`

  try {
    const draftNotes = await generateCoachAnalysis(prompt, 'flash', {
      userId: user.id,
      operation: 'weekly_check_in_draft_reply',
      entityType: 'WeeklyCheckIn',
      entityId: checkIn.id
    })

    const cleaned = draftNotes.trim()
    if (!cleaned) {
      throw new Error('Empty draft from model')
    }

    return {
      draftNotes: cleaned,
      outliers,
      checkInId: checkIn.id,
      weekStartDate: weekStartKey(checkIn.weekStartDate)
    }
  } catch (error) {
    console.error('[draft-reply] Failed to generate check-in draft:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate draft reply'
    })
  }
})
