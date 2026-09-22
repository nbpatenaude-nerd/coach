import { z } from 'zod'
import { requireAuth } from '../../../utils/auth-guard'
import { previewCommunityMatches } from '../../../utils/community-events'

/**
 * Preview Team Calendar matches for a draft event (confirm-before-dedupe).
 */
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readValidatedBody(
    event,
    z.object({
      title: z.string().min(1),
      date: z.string().min(1),
      city: z.string().optional().nullable(),
      location: z.string().optional().nullable(),
      country: z.string().optional().nullable()
    }).parse
  )

  const date = new Date(body.date)
  if (Number.isNaN(date.getTime())) {
    throw createError({ statusCode: 400, message: 'Invalid date' })
  }

  const matches = await previewCommunityMatches({
    title: body.title,
    date,
    city: body.city,
    location: body.location,
    country: body.country
  })

  return { matches }
})
