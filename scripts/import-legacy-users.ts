import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'

/**
 * CLI wrapper around the same logic as POST /api/admin/legacy-users/import.
 * Reads ./legacy_users.json from the repo root.
 *
 *   pnpm exec tsx scripts/import-legacy-users.ts
 *   pnpm exec tsx scripts/import-legacy-users.ts --prod
 */
async function main() {
  const isProd = process.argv.includes('--prod')
  const connectionString = isProd ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL

  if (!connectionString) {
    console.error('Database connection string is missing.')
    process.exit(1)
  }

  // Point the shared helper's prisma at this connection by setting DATABASE_URL
  // before dynamic-importing the app db module.
  process.env.DATABASE_URL = connectionString

  const { importLegacyUsers } = await import('../server/utils/import-legacy-users')

  const filePath = path.resolve(process.cwd(), 'legacy_users.json')
  console.log(`Reading legacy users from ${filePath}...`)
  const data = await fs.readFile(filePath, 'utf-8')
  const parsed = JSON.parse(data)
  const users = parsed.users || []
  console.log(`Found ${users.length} users to import.`)

  const summary = await importLegacyUsers(users)

  console.log('\n--- Import Summary ---')
  console.log(`Total processed: ${summary.total}`)
  console.log(`Successfully imported: ${summary.imported}`)
  console.log(`Already existed: ${summary.existing}`)
  console.log(`Skipped (no email): ${summary.skipped}`)
  if (summary.errors.length) {
    console.log(`Errors: ${summary.errors.length}`)
    for (const err of summary.errors.slice(0, 20)) {
      console.log(`  - ${err.email || err.localId}: ${err.message}`)
    }
  }

  try {
    const { prisma } = await import('../server/utils/db')
    await prisma.$disconnect()
  } catch {
    // ignore
  }
}

main().catch((err) => {
  console.error('Failed to import users:', err)
  process.exit(1)
})
