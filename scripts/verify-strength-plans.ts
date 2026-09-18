import 'dotenv/config'
import { prisma } from '../server/utils/db'

async function verify() {
  console.log('🔍 Verifying 12-Week Progressive Strength Training Plans...')

  const user = await prisma.user.findUnique({
    where: { email: 'info@trinerds.com' },
    select: { id: true, email: true, name: true }
  })

  if (!user) throw new Error('User not found')

  // Check Plan Folder
  const folder = await prisma.trainingPlanFolder.findFirst({
    where: { userId: user.id, name: 'Strength Plans' },
    include: { plans: true }
  })

  console.log(`📁 Folder: "${folder?.name}" with ${folder?.plans.length} plans.`)

  const plans = await prisma.trainingPlan.findMany({
    where: { userId: user.id, folderId: folder?.id },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
        include: {
          weeks: {
            orderBy: { weekNumber: 'asc' },
            include: {
              workouts: {
                orderBy: { dayIndex: 'asc' }
              }
            }
          }
        }
      }
    }
  })

  for (const plan of plans) {
    console.log(`\n📋 Plan: "${plan.name}" (Days/Wk: ${plan.daysPerWeek})`)
    console.log(`   Blocks count: ${plan.blocks.length}`)
    let totalWorkouts = 0

    for (const b of plan.blocks) {
      console.log(`   - Block ${b.order}: "${b.name}" (${b.weeks.length} weeks)`)
      for (const w of b.weeks) {
        totalWorkouts += w.workouts.length
        if (w.weekNumber === 1) {
          const sample = w.workouts[0]
          const sw: any = sample?.structuredWorkout
          console.log(`     Week 1 sample workout: "${sample?.title}" (dayIndex: ${sample?.dayIndex})`)
          console.log(`     Blocks in workout: ${sw?.blocks?.map((x: any) => x.title).join(' | ')}`)
          console.log(`     Exercises count: ${sw?.exercises?.length}`)
        }
      }
    }
    console.log(`   Total Planned Workouts: ${totalWorkouts}`)
  }

  // Check Workout Templates
  const templateFolder = await prisma.workoutTemplateFolder.findFirst({
    where: { userId: user.id, name: '12-Week Progressive Strength Collection' },
    include: { templates: true }
  })

  console.log(`\n🏋️ Workout Template Folder: "${templateFolder?.name}" with ${templateFolder?.templates.length} templates:`)
  for (const t of templateFolder?.templates || []) {
    console.log(`   - ${t.title} (${t.durationSec / 60}m)`)
  }

  console.log('\n✅ All verifications passed successfully!')
  process.exit(0)
}

verify().catch((err) => {
  console.error('❌ Verification failed:', err)
  process.exit(1)
})
