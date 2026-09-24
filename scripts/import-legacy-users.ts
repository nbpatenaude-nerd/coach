import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

async function main() {
  const isProd = process.argv.includes('--prod')
  const connectionString = isProd ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL

  if (!connectionString) {
    console.error('Database connection string is missing.')
    process.exit(1)
  }

  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const filePath = path.resolve(process.cwd(), 'legacy_users.json')
    console.log(`Reading legacy users from ${filePath}...`)
    const data = await fs.readFile(filePath, 'utf-8')
    const parsed = JSON.parse(data)

    const users = parsed.users || []
    console.log(`Found ${users.length} users to import.`)

    let imported = 0
    let existing = 0
    let skipped = 0

    for (const u of users) {
      if (!u.email) {
        skipped++
        continue
      }

      // Check if user already exists
      const exists = await prisma.user.findUnique({
        where: { email: u.email }
      })

      if (exists) {
        existing++
        console.log(`User ${u.email} already exists (id: ${exists.id})`)
        continue
      }

      // Create new user
      const created = await prisma.user.create({
        data: {
          id: u.localId, // Preserve Firebase ID for consistency if possible
          email: u.email,
          name: u.displayName || u.email.split('@')[0],
          image: u.photoUrl || null,
          createdAt: u.createdAt ? new Date(parseInt(u.createdAt)) : new Date()
        }
      })
      imported++
      console.log(`Imported: ${created.email} (${created.id})`)
    }

    console.log('\n--- Import Summary ---')
    console.log(`Total processed: ${users.length}`)
    console.log(`Successfully imported: ${imported}`)
    console.log(`Already existed: ${existing}`)
    console.log(`Skipped (no email): ${skipped}`)
  } catch (err) {
    console.error('Failed to import users:', err)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
