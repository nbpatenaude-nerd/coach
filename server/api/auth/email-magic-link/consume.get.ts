import { setCookie, sendRedirect } from 'h3'
import {
  createWebSessionForUser,
  isHttpsRequest,
  sanitizeReturnTo,
  sessionCookieName,
  siteOriginForEvent
} from '../../../utils/app-web-handoff'
import { consumeEmailMagicLink } from '../../../utils/email-magic-link'

defineRouteMeta({
  openAPI: {
    tags: ['Auth'],
    summary: 'Consume email magic-link session',
    description:
      'Validates a one-time email magic-link code, creates an Auth.js session cookie, and redirects to returnTo. Used for legacy athlete access emails.',
    responses: {
      302: {
        description: 'Redirect to returnTo with session cookie, or to login on invalid/expired code'
      }
    }
  }
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = typeof query.code === 'string' ? query.code : ''
  const returnTo = sanitizeReturnTo(query.returnTo, '/dashboard')
  const origin = siteOriginForEvent(event)
  const loginUrl = `${origin}/login?callbackUrl=${encodeURIComponent(returnTo)}`

  try {
    const userId = await consumeEmailMagicLink(code)
    const { sessionToken, expires } = await createWebSessionForUser(userId)
    const secure = isHttpsRequest(event)
    const cookieName = sessionCookieName(secure)

    setCookie(event, cookieName, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure,
      expires
    })

    return sendRedirect(event, `${origin}${returnTo}`, 302)
  } catch {
    return sendRedirect(event, loginUrl, 302)
  }
})
