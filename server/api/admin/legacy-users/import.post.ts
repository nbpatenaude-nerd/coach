import { requireAdmin } from '../../../utils/auth-guard'
import { importLegacyUsers, parseLegacyUsersPayload } from '../../../utils/import-legacy-users'

defineRouteMeta({
  openAPI: {
    tags: ['Admin'],
    summary: 'Import legacy Firebase users',
    description:
      'Admin-only. Creates users from a Firebase Auth export payload ({ users: [...] }). Skips existing emails; does not migrate passwords.',
    responses: {
      200: { description: 'Import summary' },
      400: { description: 'Invalid payload' },
      403: { description: 'Forbidden' }
    }
  }
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const raw = await readBody(event).catch(() => null)
  const dryRun = Boolean(raw && typeof raw === 'object' && (raw as { dryRun?: boolean }).dryRun)
  const users = parseLegacyUsersPayload(raw)

  const summary = await importLegacyUsers(users, { dryRun })
  return { success: true, dryRun, ...summary }
})
