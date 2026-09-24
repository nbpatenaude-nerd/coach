import { randomBytes } from 'node:crypto'
import { createError } from 'h3'
import type { PrismaClient } from '@prisma/client'

/** Default lifetime for emailable magic links (72 hours). */
export const EMAIL_MAGIC_LINK_TTL_SECONDS = 72 * 60 * 60

const IDENTIFIER_PREFIX = 'email-magic:'

type MagicLinkDb = Pick<PrismaClient, 'user' | 'verificationToken'>

async function resolveDb(db?: MagicLinkDb): Promise<MagicLinkDb> {
  if (db) return db
  const { prisma } = await import('./db')
  return prisma
}

export function emailMagicIdentifier(userId: string): string {
  return `${IDENTIFIER_PREFIX}${userId}`
}

function mintMagicCode(): string {
  return randomBytes(32).toString('base64url')
}

export async function createEmailMagicLink(
  userId: string,
  ttlSeconds: number = EMAIL_MAGIC_LINK_TTL_SECONDS,
  db?: MagicLinkDb
): Promise<{ code: string; expiresAt: Date; expiresIn: number }> {
  if (!Number.isFinite(ttlSeconds) || ttlSeconds < 60 || ttlSeconds > 30 * 24 * 60 * 60) {
    throw createError({
      statusCode: 400,
      message: 'Magic link TTL must be between 60 seconds and 30 days'
    })
  }

  const client = await resolveDb(db)
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { id: true, deactivatedAt: true, email: true }
  })
  if (!user || user.deactivatedAt) {
    throw createError({ statusCode: 404, message: 'User not found or deactivated' })
  }

  const identifier = emailMagicIdentifier(userId)
  const code = mintMagicCode()
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000)

  // One outstanding email magic link per user — clear prior unused codes.
  await client.verificationToken.deleteMany({ where: { identifier } })
  await client.verificationToken.create({
    data: { identifier, token: code, expires: expiresAt }
  })

  return { code, expiresAt, expiresIn: ttlSeconds }
}

export async function consumeEmailMagicLink(code: string, db?: MagicLinkDb): Promise<string> {
  if (!code || typeof code !== 'string') {
    throw createError({ statusCode: 400, message: 'Missing magic link code' })
  }

  const client = await resolveDb(db)
  const row = await client.verificationToken.findFirst({
    where: { token: code, identifier: { startsWith: IDENTIFIER_PREFIX } }
  })

  if (!row) {
    throw createError({ statusCode: 401, message: 'Invalid or expired magic link' })
  }

  // Delete-then-use so replay fails even if two requests race.
  const deleted = await client.verificationToken.deleteMany({
    where: { identifier: row.identifier, token: row.token }
  })
  if (deleted.count === 0) {
    throw createError({ statusCode: 401, message: 'Invalid or expired magic link' })
  }

  if (row.expires.getTime() < Date.now()) {
    throw createError({ statusCode: 401, message: 'Invalid or expired magic link' })
  }

  const userId = row.identifier.slice(IDENTIFIER_PREFIX.length)
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Invalid or expired magic link' })
  }

  const user = await client.user.findUnique({
    where: { id: userId },
    select: { id: true, deactivatedAt: true }
  })
  if (!user || user.deactivatedAt) {
    throw createError({ statusCode: 401, message: 'Invalid or expired magic link' })
  }

  return user.id
}

export function buildEmailMagicLinkUrl(options: {
  siteUrl: string
  code: string
  returnTo?: string
}): string {
  const base = options.siteUrl.replace(/\/$/, '')
  const url = new URL('/api/auth/email-magic-link/consume', base)
  url.searchParams.set('code', options.code)
  if (options.returnTo && options.returnTo !== '/') {
    url.searchParams.set('returnTo', options.returnTo)
  }
  return url.toString()
}

export function buildEmailMagicLinkHtml(options: {
  magicUrl: string
  athleteName?: string | null
  expiresAt: Date
  siteUrl: string
}): { subject: string; html: string; text: string } {
  const name = options.athleteName?.trim() || 'there'
  const siteUrl = options.siteUrl.replace(/\/$/, '')
  const expiresLabel = options.expiresAt.toUTCString()
  const subject = 'Your Journey Endurance access link'
  const appHostLabel = (() => {
    try {
      return new URL(siteUrl).host
    } catch {
      return 'app.journeyendurance.ca'
    }
  })()

  const text = [
    `Hi ${name},`,
    '',
    `Use this one-time link to open your Journey Endurance account on ${appHostLabel}:`,
    options.magicUrl,
    '',
    `This link expires on ${expiresLabel} and can only be used once.`,
    '',
    'After you sign in, connect Google or Apple on the same email so you can return easily next time.',
    '',
    `— Journey Endurance`,
    siteUrl
  ].join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:40px 0;background:#f4f4f5;font-family:'Public Sans',Inter,Helvetica,Arial,sans-serif;color:#09090b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="600" style="max-width:600px;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;">
          <tr><td style="height:4px;background:linear-gradient(135deg,#00dc82 0%,#00c16a 100%);"></td></tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 8px;font-size:14px;color:#71717a;">Journey Endurance</p>
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;letter-spacing:-0.025em;">Your account is ready</h1>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.5;color:#3f3f46;">
                Hi ${escapeHtml(name)}, tap the button below to sign in to your Journey Endurance account at <strong>${escapeHtml(appHostLabel)}</strong>. This link works once and expires on <strong>${escapeHtml(expiresLabel)}</strong>.
              </p>
              <p style="margin:0 0 28px;">
                <a href="${escapeHtml(options.magicUrl)}" style="display:inline-block;background:#00c16a;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:8px;">
                  Open Journey Endurance
                </a>
              </p>
              <p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:#71717a;">
                If the button does not work, paste this URL into your browser:<br />
                <a href="${escapeHtml(options.magicUrl)}" style="color:#00c16a;word-break:break-all;">${escapeHtml(options.magicUrl)}</a>
              </p>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#71717a;">
                After you sign in, connect Google or Apple with the same email so future logins are easy.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;">
          <a href="${escapeHtml(siteUrl)}" style="color:#a1a1aa;text-decoration:none;">${escapeHtml(siteUrl)}</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html, text }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
