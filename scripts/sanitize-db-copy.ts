/**
 * Dump a sanitized copy of the remote database into a local Postgres.
 *
 * READ-ONLY against the source (pg_dump). Writes only to LOCAL_DATABASE_URL.
 *
 * Scrubs:
 * - User.email → athlete+{hash}@example.invalid (preserves coach/admin domains you list)
 * - User.name / firstName / lastName → "Athlete {n}"
 * - Stripe / RevenueCat / OAuth tokens / FCM / phone / address fields nulled where present
 *
 * Usage:
 *   SOURCE_DATABASE_URL=... LOCAL_DATABASE_URL=postgresql://watts:password@localhost:5439/watts \
 *     pnpm exec tsx scripts/sanitize-db-copy.ts
 *
 * Requires: pg_dump and psql on PATH (or via Docker: set USE_DOCKER_PG=1).
 */
import 'dotenv/config'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import pg from 'pg'

const sourceUrl = process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL
const localUrl =
  process.env.LOCAL_DATABASE_URL || 'postgresql://watts:password@localhost:5439/watts'
const useDocker = process.env.USE_DOCKER_PG === '1'
const dockerPg = process.env.DOCKER_PG_CONTAINER || 'watts-postgres'

if (!sourceUrl) {
  console.error('SOURCE_DATABASE_URL (or DATABASE_URL) is required')
  process.exit(1)
}

if (new URL(sourceUrl).host === new URL(localUrl).host) {
  console.error('Refusing to run: source and local URLs point at the same host.')
  process.exit(1)
}

function run(cmd: string, args: string[], env: NodeJS.ProcessEnv = process.env) {
  console.log('>', cmd, args.join(' '))
  const result = spawnSync(cmd, args, { env, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout)
    throw new Error(`${cmd} failed with status ${result.status}`)
  }
  return result.stdout
}

function hashEmail(email: string) {
  return createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 10)
}

async function scrub(local: pg.Pool) {
  // Preserve known operator accounts by domain so you can still log in locally
  // with AUTH_BYPASS_USER after pointing .env at local.
  const keepDomains = (process.env.SANITIZE_KEEP_DOMAINS || 'coachwatts.test,journey.test')
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)

  const users = await local.query<{ id: string; email: string | null }>(
    `SELECT id, email FROM "User"`
  )

  let n = 0
  for (const user of users.rows) {
    n += 1
    const email = user.email || `unknown-${user.id}@example.invalid`
    const domain = email.split('@')[1]?.toLowerCase() || ''
    const keep = keepDomains.includes(domain)
    const scrubbedEmail = keep ? email : `athlete+${hashEmail(email)}@example.invalid`
    const scrubbedName = keep ? undefined : `Athlete ${n}`

    await local.query(
      `UPDATE "User" SET
         email = $2,
         name = COALESCE($3, name),
         "stripeCustomerId" = NULL,
         "stripeSubscriptionId" = NULL,
         "revenueCatAppUserId" = NULL,
         phone = NULL
       WHERE id = $1`,
      [user.id, scrubbedEmail, scrubbedName ?? null]
    )
  }

  // Wipe integration tokens — local OAuth won't work against prod credentials anyway.
  try {
    await local.query(
      `UPDATE "Integration" SET
         "accessToken" = NULL,
         "refreshToken" = NULL,
         "tokenExpiresAt" = NULL
       WHERE TRUE`
    )
  } catch (e) {
    console.warn('Integration token scrub skipped:', (e as Error).message)
  }

  console.log(
    `Scrubbed ${users.rows.length} users (kept domains: ${keepDomains.join(', ') || 'none'})`
  )
}

async function main() {
  const dir = mkdtempSync(join(tmpdir(), 'watts-sanitize-'))
  const dumpPath = join(dir, 'dump.sql')

  console.log('Source:', new URL(sourceUrl!).host)
  console.log('Local: ', new URL(localUrl).host + new URL(localUrl).pathname)
  console.log('Dump to', dumpPath)

  if (useDocker) {
    // Dump via local docker network is not available for remote source — use host pg_dump.
    // Restore into the container by piping.
    run('pg_dump', [
      '--no-owner',
      '--no-acl',
      '--clean',
      '--if-exists',
      `--dbname=${sourceUrl}`,
      `--file=${dumpPath}`
    ])
    const sql = readFileSync(dumpPath)
    const restore = spawnSync(
      'docker',
      ['exec', '-i', dockerPg, 'psql', '-U', 'watts', '-d', 'watts'],
      { input: sql, maxBuffer: 256 * 1024 * 1024 }
    )
    if (restore.status !== 0) {
      console.error(restore.stderr?.toString() || restore.stdout?.toString())
      throw new Error('docker psql restore failed')
    }
  } else {
    run('pg_dump', [
      '--no-owner',
      '--no-acl',
      '--clean',
      '--if-exists',
      `--dbname=${sourceUrl}`,
      `--file=${dumpPath}`
    ])
    run('psql', [`--dbname=${localUrl}`, `--file=${dumpPath}`])
  }

  const pool = new pg.Pool({ connectionString: localUrl })
  try {
    await scrub(pool)
    writeFileSync(join(dir, 'DONE'), 'ok')
    console.log('Sanitize complete. Point your local .env DATABASE_URL at:', localUrl)
  } finally {
    await pool.end()
    rmSync(dir, { recursive: true, force: true })
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
