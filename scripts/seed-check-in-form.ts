import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import {
  DEFAULT_CHECK_IN_FORM,
  DEFAULT_CHECK_IN_FORM_SLUG,
  checkInFields
} from '../shared/check-in'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

// Seeds (or refreshes) the default weekly check-in form from
// shared/check-in.ts. Idempotent on the slug, so re-running after editing the
// default definition pushes the new question set.
//
// Editing questions in the database directly is also supported and is the
// expected path once athletes have history — this script bumps `version` on
// every content change so submissions can be traced to the question set they
// were answered against.
async function main() {
  const sections = DEFAULT_CHECK_IN_FORM.sections
  const fieldCount = checkInFields(DEFAULT_CHECK_IN_FORM).length

  const existing = await prisma.checkInForm.findUnique({
    where: { slug: DEFAULT_CHECK_IN_FORM_SLUG }
  })

  const definitionChanged =
    !existing || JSON.stringify(existing.sections) !== JSON.stringify(sections)

  const form = await prisma.checkInForm.upsert({
    where: { slug: DEFAULT_CHECK_IN_FORM_SLUG },
    create: {
      slug: DEFAULT_CHECK_IN_FORM_SLUG,
      title: 'Weekly Check-In',
      description:
        'Self-report on your training, health, and personal week so your coach can review it alongside your data.',
      sections,
      isActive: true,
      version: 1
    },
    update: {
      sections,
      isActive: true,
      ...(definitionChanged && existing ? { version: existing.version + 1 } : {})
    }
  })

  if (!existing) {
    console.log(
      `Created check-in form "${form.slug}" (v${form.version}) with ${fieldCount} fields.`
    )
  } else if (definitionChanged) {
    console.log(`Updated check-in form "${form.slug}" to v${form.version} (${fieldCount} fields).`)
  } else {
    console.log(`Check-in form "${form.slug}" already up to date (v${form.version}).`)
  }

  const sectionSummary = sections
    .map((section) => `${section.heading}: ${section.fields.length}`)
    .join(', ')
  console.log(`Sections — ${sectionSummary}`)
}

main()
  .catch((error) => {
    console.error('Failed to seed check-in form:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
