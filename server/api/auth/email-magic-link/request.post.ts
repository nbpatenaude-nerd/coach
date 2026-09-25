import { z } from 'zod'
import { prisma } from '../../../utils/db'
import { sendEmail } from '../../../utils/email'
import {
  EMAIL_MAGIC_LINK_TTL_SECONDS,
  buildEmailMagicLinkHtml,
  buildEmailMagicLinkUrl,
  createEmailMagicLink
} from '../../../utils/email-magic-link'
import { sanitizeReturnTo, siteOriginForEvent } from '../../../utils/app-web-handoff'
import { checkRateLimit, getRateLimitKeyFromEvent } from '../../../utils/rate-limit'
import { verifyTurnstileToken } from '../../../utils/turnstile'

const schema = z.object({
  email: z.string().email(),
  returnTo: z.string().optional(),
  turnstileToken: z.string().optional(),
  /** Honeypot — must stay empty. */
  website: z.string().optional()
})

defineRouteMeta({
  openAPI: {
    tags: ['Auth'],
    summary: 'Request email magic-link sign-in',
    description:
      'Emails a one-time sign-in link to an existing athlete. Always returns success to avoid account enumeration. Used for legacy athletes without OAuth.',
    responses: {
      200: { description: 'Request accepted (email may or may not have been sent)' },
      400: { description: 'Invalid email or captcha' },
      429: { description: 'Too many requests' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const raw = await readBody(event).catch(() => ({}))
  const body = schema.safeParse({
    email: typeof raw?.email === 'string' ? raw.email.trim().toLowerCase() : raw?.email,
    returnTo: raw?.returnTo,
    turnstileToken: raw?.turnstileToken,
    website: raw?.website
  })
  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email address'
    })
  }

  // Bots that fill honeypot get a fake success (no email).
  if (body.data.website) {
    return { success: true }
  }

  const email = body.data.email
  const returnTo = sanitizeReturnTo(body.data.returnTo, '/dashboard')
  const ip = getRateLimitKeyFromEvent({
    headers: {
      'x-forwarded-for': getHeader(event, 'x-forwarded-for') || undefined
    }
  })

  const captcha = await verifyTurnstileToken(body.data.turnstileToken, ip === 'unknown' ? null : ip)
  if (!captcha.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please complete the captcha and try again.'
    })
  }

  const ipLimit = checkRateLimit('email-magic-link-ip', ip, {
    windowMs: 15 * 60 * 1000,
    maxAttempts: 10,
    minIntervalMs: 2000
  })
  if (!ipLimit.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many sign-in requests. Please try again shortly.',
      data: { retryAfterMs: ipLimit.retryAfterMs }
    })
  }

  const emailLimit = checkRateLimit('email-magic-link-email', email, {
    windowMs: 15 * 60 * 1000,
    maxAttempts: 5,
    minIntervalMs: 30_000
  })
  if (!emailLimit.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many sign-in requests. Please try again shortly.',
      data: { retryAfterMs: emailLimit.retryAfterMs }
    })
  }

  const processRequest = async () => {
    if (process.env.CW_DISABLE_EMAILS === '1') {
      console.warn('[email-magic-link] CW_DISABLE_EMAILS=1 — skipping send for', email)
      return
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, deactivatedAt: true }
    })
    if (!user || user.deactivatedAt || !user.email) return

    const { code, expiresAt } = await createEmailMagicLink(user.id, EMAIL_MAGIC_LINK_TTL_SECONDS)
    const siteUrl = siteOriginForEvent(event)
    const magicUrl = buildEmailMagicLinkUrl({ siteUrl, code, returnTo })
    const { subject, html, text } = buildEmailMagicLinkHtml({
      magicUrl,
      athleteName: user.name,
      expiresAt,
      siteUrl
    })

    await sendEmail({ to: user.email, subject, html, text })
  }

  // Fire-and-forget so timing does not reveal whether the account exists.
  processRequest().catch((error) => {
    console.error('[email-magic-link] Failed to send sign-in link:', error)
  })

  return { success: true }
})
