import 'dotenv/config'
import { prisma } from '../server/utils/db.js'

async function main() {
  console.log('Seeding CRM Pipelines...')

  // Create Main Pipeline
  const mainPipeline = await prisma.crmPipeline.create({
    data: {
      name: 'Coaching Sales',
      description: 'Default pipeline for inbound leads',
      stages: {
        create: [
          { name: 'Lead', order: 0, color: 'gray' },
          { name: 'Prospect', order: 1, color: 'blue' },
          { name: 'Active', order: 2, color: 'green' },
          { name: 'Alumni', order: 3, color: 'orange' }
        ]
      }
    },
    include: { stages: true }
  })

  console.log('Created pipeline:', mainPipeline.name)

  // Migrate existing users to the new CRM Pipeline
  const users = await prisma.user.findMany({
    where: {
      pipelineStage: { not: null }
    }
  })

  console.log(`Found ${users.length} users with legacy pipeline stages.`)

  let migratedCount = 0
  for (const user of users) {
    // Find the matching stage id in the new pipeline
    const legacyStage = user.pipelineStage || 'Lead'
    let matchingStage = mainPipeline.stages.find(
      (s) => s.name.toLowerCase() === legacyStage.toLowerCase()
    )

    if (!matchingStage) {
      matchingStage = mainPipeline.stages.find((s) => s.name === 'Lead')
    }

    if (matchingStage) {
      await prisma.crmDeal.create({
        data: {
          userId: user.id,
          pipelineId: mainPipeline.id,
          stageId: matchingStage.id,
          name: `${user.id.substring(0, 8)} Deal`
        }
      })
      migratedCount++
    }
  }

  console.log(`Successfully migrated ${migratedCount} users to CrmDeal records.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
