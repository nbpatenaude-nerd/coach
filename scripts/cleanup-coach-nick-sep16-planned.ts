/**
 * Dry-run / delete PlannedWorkouts for Coach Nick on 2026-09-16
 * (bulk library upload accidentally scheduled templates onto the calendar).
 *
 * Usage:
 *   npx tsx scripts/cleanup-coach-nick-sep16-planned.ts           # dry-run
 *   npx tsx scripts/cleanup-coach-nick-sep16-planned.ts --apply   # delete
 */
import 'dotenv/config'
import { prisma } from '../server/utils/db'

const COACH_NICK_USER_ID = '2dd94868-f861-459d-8b83-b9f75b4b9a16'
const COACH_NICK_EMAIL = 'info@trinerds.com'
const TARGET_DATE = '2026-09-16'

async function main() {
  const apply = process.argv.includes('--apply')

  const user =
    (await prisma.user.findUnique({ where: { id: COACH_NICK_USER_ID } })) ||
    (await prisma.user.findFirst({ where: { email: COACH_NICK_EMAIL } }))

  if (!user) {
    console.error(`User not found (id=${COACH_NICK_USER_ID} email=${COACH_NICK_EMAIL})`)
    process.exit(1)
  }

  console.log(`Target user: ${user.name || '(no name)'} <${user.email}> (${user.id})`)
  console.log(`Target date: ${TARGET_DATE}`)
  console.log(`Mode: ${apply ? 'APPLY (delete)' : 'DRY-RUN'}`)

  const dayStart = new Date(`${TARGET_DATE}T00:00:00.000Z`)
  const dayEnd = new Date(`${TARGET_DATE}T23:59:59.999Z`)

  const workouts = await prisma.plannedWorkout.findMany({
    where: {
      userId: user.id,
      date: { gte: dayStart, lte: dayEnd }
    },
    select: {
      id: true,
      title: true,
      type: true,
      date: true,
      externalId: true,
      createdAt: true,
      completed: true,
      managedBy: true
    },
    orderBy: { createdAt: 'asc' }
  })

  console.log(`\nFound ${workouts.length} planned workout(s) on ${TARGET_DATE}:`)
  for (const w of workouts) {
    console.log(
      `  - ${w.date.toISOString().slice(0, 10)} | ${w.type || '?'} | ${w.title} | id=${w.id} | managedBy=${w.managedBy} | completed=${w.completed}`
    )
  }

  if (!workouts.length) {
    console.log('\nNothing to delete.')
    return
  }

  if (!apply) {
    console.log(`\nDry-run only. Re-run with --apply to delete these ${workouts.length} row(s).`)
    return
  }

  const ids = workouts.map((w) => w.id)
  const result = await prisma.plannedWorkout.deleteMany({
    where: { id: { in: ids }, userId: user.id }
  })
  console.log(`\nDeleted ${result.count} planned workout(s).`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
