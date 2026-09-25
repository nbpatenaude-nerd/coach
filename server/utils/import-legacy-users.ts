import { createError } from 'h3'
import { prisma } from './db'

export type LegacyUserInput = {
  localId?: string
  email?: string
  displayName?: string | null
  photoUrl?: string | null
  createdAt?: string | number | null
}

export type LegacyImportResult = {
  total: number
  imported: number
  existing: number
  skipped: number
  errors: Array<{ email?: string; localId?: string; message: string }>
  importedEmails: string[]
}

function parseCreatedAt(value: string | number | null | undefined): Date {
  if (value == null || value === '') return new Date()
  if (typeof value === 'number') return new Date(value)
  const asNumber = Number(value)
  if (Number.isFinite(asNumber) && String(value).trim() !== '') {
    return new Date(asNumber)
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

/**
 * Idempotent create-only import of Firebase-export style users.
 * Skips missing emails and emails that already exist. Does not migrate passwords.
 */
export async function importLegacyUsers(
  users: LegacyUserInput[],
  options?: { dryRun?: boolean; maxUsers?: number }
): Promise<LegacyImportResult> {
  const maxUsers = options?.maxUsers ?? 10_000
  if (users.length > maxUsers) {
    throw createError({
      statusCode: 400,
      statusMessage: `Too many users (${users.length}). Max per import is ${maxUsers}.`
    })
  }

  const dryRun = Boolean(options?.dryRun)
  const result: LegacyImportResult = {
    total: users.length,
    imported: 0,
    existing: 0,
    skipped: 0,
    errors: [],
    importedEmails: []
  }

  for (const u of users) {
    const email = typeof u.email === 'string' ? u.email.trim().toLowerCase() : ''
    if (!email) {
      result.skipped++
      continue
    }

    try {
      const exists = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      })
      if (exists) {
        result.existing++
        continue
      }

      if (dryRun) {
        result.imported++
        result.importedEmails.push(email)
        continue
      }

      const id = typeof u.localId === 'string' && u.localId.trim() ? u.localId.trim() : undefined

      const created = await prisma.user.create({
        data: {
          ...(id ? { id } : {}),
          email,
          name: (u.displayName && String(u.displayName).trim()) || email.split('@')[0],
          image: u.photoUrl || null,
          createdAt: parseCreatedAt(u.createdAt)
        }
      })
      result.imported++
      result.importedEmails.push(created.email)
    } catch (error: any) {
      result.errors.push({
        email,
        localId: u.localId,
        message: error?.message || 'Failed to import user'
      })
    }
  }

  return result
}

export function parseLegacyUsersPayload(body: unknown): LegacyUserInput[] {
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON body' })
  }
  const record = body as Record<string, unknown>
  const users = Array.isArray(record.users) ? record.users : Array.isArray(body) ? body : null
  if (!users) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Body must be { users: [...] } or a user array'
    })
  }
  return users as LegacyUserInput[]
}
