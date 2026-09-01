import { z } from 'zod'
import { requireAuth } from '../../../utils/auth-guard'
import { trainingPlanRepository } from '../../../utils/repositories/trainingPlanRepository'
import { sportSettingsRepository } from '../../../utils/repositories/sportSettingsRepository'
import { buildTemplateStructureWriteData } from '../../../utils/canonical-planned-workout-write'
import { getStartOfDayUTC } from '../../../utils/date'

const applyPlanSchema = z.object({
  planId: z.string(),
  athleteIds: z.array(z.string()).min(1),
  startDate: z.string() // ISO date
})

export default defineEventHandler(async (event) => {
  const authUser = await requireAuth(event, ['coaching:write', 'plan:write'])
  const body = await readBody(event)
  const validation = applyPlanSchema.safeParse(body)

  if (!validation.success) {
    throw createError({ statusCode: 400, message: validation.error.message })
  }

  const { planId, athleteIds, startDate } = validation.data
  const rawDate = new Date(startDate)
  const targetStartDate = new Date(
    Date.UTC(rawDate.getUTCFullYear(), rawDate.getUTCMonth(), rawDate.getUTCDate())
  )

  // Fetch the template plan
  const plan = await trainingPlanRepository.getById(planId, authUser.id, {
    include: {
      blocks: {
        orderBy: { order: 'asc' },
        include: {
          weeks: {
            orderBy: { weekNumber: 'asc' },
            include: { workouts: true }
          }
        }
      }
    }
  })

  if (!plan || !plan.isTemplate) {
    throw createError({ statusCode: 404, message: 'Template plan not found' })
  }

  const results = []

  for (const athleteId of athleteIds) {
    try {
      // Archive existing plans for the athlete
      const activePlans = await trainingPlanRepository.list(athleteId, { status: 'ACTIVE' })
      const plansToArchive = activePlans.filter((p) => !p.isTemplate)
      for (const p of plansToArchive) {
        await trainingPlanRepository.cleanupWorkouts(athleteId, p.id, targetStartDate)
      }
      await trainingPlanRepository.archiveAllExcept(athleteId, 'NONE')

      const settingsByType = new Map<string, any>()
      for (const block of plan.blocks) {
        const blockWeeks = 'weeks' in block && Array.isArray(block.weeks) ? block.weeks : []
        for (const week of blockWeeks) {
          for (const workout of week.workouts) {
            const type = workout.type || 'Ride'
            if (!settingsByType.has(type)) {
              settingsByType.set(
                type,
                await sportSettingsRepository.getForActivityType(athleteId, type)
              )
            }
          }
        }
      }

      const templateStructureFields = (workout: any) => {
        if (!workout.structuredWorkout) return {}
        const settings = settingsByType.get(workout.type || 'Ride') || {}
        return buildTemplateStructureWriteData({
          structure: workout.structuredWorkout,
          sportSettings: settings,
          preservePlannedDuration: workout.durationSec,
          syncStatus: 'LOCAL_ONLY'
        }).data
      }

      const newPlan = await trainingPlanRepository.create({
        userId: athleteId,
        goalId: null,
        name: plan.name,
        description: plan.description,
        strategy: plan.strategy,
        status: 'ACTIVE',
        startDate: targetStartDate,
        isTemplate: false,
        visibility: 'PRIVATE',
        accessState: 'PRIVATE',
        blocks: {
          create: plan.blocks.map((block: any) => ({
            name: block.name,
            order: block.order,
            type: block.type,
            primaryFocus: block.primaryFocus,
            durationWeeks: block.durationWeeks,
            startDate: targetStartDate,
            weeks: {
              create: ('weeks' in block && Array.isArray(block.weeks) ? block.weeks : []).map(
                (week: any) => ({
                  weekNumber: week.weekNumber,
                  volumeTargetMinutes: week.volumeTargetMinutes,
                  tssTarget: week.tssTarget,
                  isRecovery: week.isRecovery,
                  startDate: targetStartDate,
                  endDate: targetStartDate,
                  workouts: {
                    create: week.workouts.map((w: any) => ({
                      title: w.title,
                      description: w.description,
                      type: w.type,
                      category: w.category,
                      durationSec: w.durationSec,
                      tss: w.tss,
                      workIntensity: w.workIntensity,
                      status: 'PLANNED',
                      syncStatus: 'LOCAL_ONLY',
                      date: targetStartDate,
                      managedBy: 'COACH_WATTS',
                      ...templateStructureFields(w)
                    }))
                  }
                })
              )
            }
          }))
        }
      })

      // Compute dates
      // await trainingPlanRepository.recalculateDates(athleteId, newPlan.id)

      results.push({ athleteId, success: true, planId: newPlan.id })
    } catch (e: any) {
      console.error(`Failed to apply plan to athlete ${athleteId}:`, e)
      results.push({ athleteId, success: false, error: e.message })
    }
  }

  return { success: true, results }
})
