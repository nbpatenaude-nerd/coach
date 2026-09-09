import { defineEventHandler, readBody } from 'h3'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.name || !body.stages || !Array.isArray(body.stages)) {
    throw createError({ statusCode: 400, message: 'Invalid pipeline payload' })
  }

  const pipeline = await prisma.crmPipeline.create({
    data: {
      name: body.name,
      description: body.description,
      stages: {
        create: body.stages.map((stageName: string, index: number) => ({
          name: stageName,
          order: index,
          color:
            index === 0 ? '#3b82f6' : index === 1 ? '#f59e0b' : index === 2 ? '#10b981' : '#64748b'
        }))
      }
    }
  })

  return pipeline
})
