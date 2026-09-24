import { requireAuth } from '../../utils/auth-guard'
import { upsertWeeklyCheckIn, weekStartKey } from '../../utils/services/weeklyCheckInService'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, [])
  const body = await readBody(event)

  // Accept either { responses: {...} } or a flat map of field ids (legacy clients).
  const raw =
    body?.responses && typeof body.responses === 'object' && !Array.isArray(body.responses)
      ? (body.responses as Record<string, unknown>)
      : (body as Record<string, unknown>)

  // Strip non-field keys that a flat body might include.
  const { responses: _r, weekStartDate: _w, ...flat } = raw
  const fieldMap = body?.responses ? raw : flat

  const checkIn = await upsertWeeklyCheckIn(user.id, fieldMap)

  return {
    status: 'success',
    data: {
      id: checkIn.id,
      weekStartDate: weekStartKey(checkIn.weekStartDate),
      responses: checkIn.responses,
      submittedAt: checkIn.submittedAt.toISOString(),
      updatedAt: checkIn.updatedAt.toISOString(),
      status: checkIn.status,
      coachNotes: checkIn.coachNotes,
      coachVideoUrl: checkIn.coachVideoUrl,
      coachVideoAddedAt: checkIn.coachVideoAddedAt?.toISOString() ?? null,
      coachReviewedAt: checkIn.coachReviewedAt?.toISOString() ?? null
    }
  }
})
