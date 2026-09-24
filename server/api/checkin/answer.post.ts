import { z } from 'zod'
import { tasks } from '@trigger.dev/sdk/v3'
import { requireAuth } from '../../utils/auth-guard'
import { dailyCheckinRepository } from '../../utils/repositories/dailyCheckinRepository'
import { wellnessRepository } from '../../utils/repositories/wellnessRepository'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['health:write'])

  const body = await readBody(event)
  const { checkinId, answers, userNotes, bloodGlucose } = body
  // answers: Record<string, "YES" | "NO">

  if (!checkinId || !answers) {
    throw createError({ statusCode: 400, message: 'Missing checkinId or answers' })
  }

  const checkin = await dailyCheckinRepository.findById(checkinId)

  if (!checkin) {
    throw createError({ statusCode: 404, message: 'Check-in not found' })
  }

  if (checkin.userId !== user.id) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  // Update the JSON questions with answers
  const questions = checkin.questions as any[]
  const updatedQuestions = questions.map((q) => {
    if (answers[q.id]) {
      return { ...q, answer: answers[q.id] }
    }
    return q
  })

  const updatedCheckin = await dailyCheckinRepository.update(checkinId, {
    questions: updatedQuestions,
    userNotes: userNotes || undefined
  })

  // Update Wellness if bloodGlucose is provided
  if (bloodGlucose !== undefined && bloodGlucose !== null) {
    const checkinDate = new Date(checkin.date)
    await wellnessRepository.upsert(
      user.id,
      checkinDate,
      { bloodGlucose }, // createData
      { bloodGlucose }, // updateData
      'daily_checkin' // source
    )
  }

  if (['UNCOVER', 'UNLOCK', 'UNLEASH'].includes(user.subscriptionTier)) {
    await tasks.trigger('analyze-daily-checkin', {
      checkinId: updatedCheckin.id,
      userId: user.id
    })
  }

  return updatedCheckin
})
