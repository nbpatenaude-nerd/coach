/**
 * Verify a Cloudflare Turnstile token.
 * Returns true when verification succeeds, or when Turnstile is not configured (dev).
 */
export async function verifyTurnstileToken(
  token: unknown,
  remoteIp?: string | null
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim()
  if (!secret) {
    // Not configured — allow the request (rate limits still apply).
    return { ok: true }
  }

  if (typeof token !== 'string' || !token.trim()) {
    return { ok: false, reason: 'Missing captcha token' }
  }

  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', token.trim())
  if (remoteIp) body.set('remoteip', remoteIp)

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body
    })
    const data = (await response.json()) as { success?: boolean; 'error-codes'?: string[] }
    if (!data.success) {
      return {
        ok: false,
        reason: data['error-codes']?.join(', ') || 'Captcha verification failed'
      }
    }
    return { ok: true }
  } catch (error) {
    console.error('[turnstile] siteverify failed:', error)
    return { ok: false, reason: 'Captcha verification unavailable' }
  }
}

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim())
}
