import { z } from 'zod'
import { prisma } from '../db'
import { generateStructuredAnalysis } from '../gemini'
import { tasks } from '@trigger.dev/sdk/v3'
import { getUserTimezone, getUserLocalDate } from '../date'

const AdaptationSchema = z.object({
  needsAdjustment: z
    .boolean()
    .describe('Whether the athlete needs a reduction in training intensity today'),
  adjustmentPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe('The percentage to reduce training by (0-100)'),
  reasoning: z.string().describe('The reasoning for the adaptation or lack thereof')
})

export async function analyzeDailyCheckin(checkinId: string, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, subscriptionTier: true }
  })
  if (!user) throw new Error('User not found')

  const checkin = await prisma.dailyCheckin.findUnique({
    where: { id: checkinId }
  })
  if (!checkin) throw new Error('Check-in not found')

  const checkinDate = new Date(checkin.date)
  const wellness = await prisma.wellness.findUnique({
    where: { userId_date: { userId, date: checkinDate } }
  })

  const timezone = await getUserTimezone(userId)
  const localToday = getUserLocalDate(timezone)

  // Only adapt workouts for today
  const plannedWorkouts = await prisma.plannedWorkout.findMany({
    where: {
      userId,
      date: localToday,
      completed: false
    }
  })

  if (plannedWorkouts.length === 0) {
    return { success: true, message: 'No workouts to adapt today.' }
  }

  const prompt = `
You are Journey, an expert endurance coach.
Review this athlete's morning check-in answers and their wellness data.

Check-in Answers:
${JSON.stringify(checkin.questions, null, 2)}

User Notes:
${checkin.userNotes || 'None'}

Wellness Data (Recovery Score, etc.):
${JSON.stringify(wellness || {}, null, 2)}

Today's Planned Workouts:
${JSON.stringify(
  plannedWorkouts.map((w) => ({
    id: w.id,
    title: w.title,
    durationSec: w.durationSec,
    tss: w.tss,
    workIntensity: w.workIntensity
  })),
  null,
  2
)}

Based on this information, do they need a reduction in training intensity today?
Max reduction for automated adjustment is 20%. If they are doing very poorly, recommend a larger adjustment (we will use this to notify their human coach).
`

  const analysis = await generateStructuredAnalysis<z.infer<typeof AdaptationSchema>>(
    prompt,
    AdaptationSchema,
    'flash',
    {
      userId,
      operation: 'analyze_daily_checkin',
      entityId: checkinId,
      entityType: 'daily_checkin'
    }
  )

  if (analysis.needsAdjustment && analysis.adjustmentPercentage > 0) {
    if (analysis.adjustmentPercentage <= 20) {
      // Save proposed adjustment for user confirmation
      await prisma.dailyCheckin.update({
        where: { id: checkinId },
        data: {
          proposedAdjustmentPercentage: analysis.adjustmentPercentage,
          proposedAdjustmentReasoning: analysis.reasoning,
          adjustmentStatus: 'PENDING'
        }
      })
      return { success: true, proposed: true, analysis }
    } else {
      // Need manual review - notify coach
      const coachRel = await prisma.coachingRelationship.findFirst({
        where: { athleteId: userId, status: 'ACTIVE' },
        include: { coach: true }
      })

      const coachEmail = coachRel?.coach?.email || 'info@trinerds.com'
      const coachName = coachRel?.coach?.name || 'Coach'

      await tasks.trigger('send-email', {
        userId, // For logging/tracking
        toEmail: coachEmail,
        ccEmail: user.email,
        templateKey: 'ManualReviewRequired',
        eventKey: `manual-review-${checkinId}`,
        audience: 'TRANSACTIONAL',
        subject: `Manual Review Required: ${user.email} Morning Check-In`,
        props: {
          coachEmail,
          coachName,
          athleteEmail: user.email,
          reasoning: analysis.reasoning,
          adjustmentPercentage: analysis.adjustmentPercentage,
          checkinDate: checkinDate.toISOString()
        }
      })

      return {
        success: true,
        adapted: false,
        message: 'Coach notified for manual review.',
        analysis
      }
    }
  }

  return { success: true, adapted: false, message: 'No adaptation needed.', analysis }
}
