import { task, tasks } from '@trigger.dev/sdk'
import { prisma } from '~/server/utils/db'

interface BookAppointmentPayload {
  bookingId: string
  coachUserId: string
  coachName: string | null
  coachEmail: string
  meetingTypeName: string
  conferenceUrl: string | null
}

export const bookAppointmentTask = task({
  id: 'book-appointment',
  retry: { maxAttempts: 3 },
  run: async (payload: BookAppointmentPayload) => {
    const { bookingId, coachUserId, coachName, coachEmail, meetingTypeName, conferenceUrl } =
      payload

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) {
      console.error('Booking not found:', bookingId)
      return
    }

    // 1. Create CRM Lead
    try {
      let prospectUser = await prisma.user.findFirst({ where: { email: booking.prospectEmail } })
      if (!prospectUser) {
        prospectUser = await prisma.user.create({
          data: {
            email: booking.prospectEmail,
            name: booking.prospectName,
            leadSource: 'booking'
          }
        })
      }

      let pipeline = await prisma.crmPipeline.findFirst({ where: { isActive: true } })
      if (!pipeline) {
        pipeline = await prisma.crmPipeline.create({
          data: { name: 'Sales Pipeline', isActive: true }
        })
      }

      let leadStage = await prisma.crmPipelineStage.findFirst({
        where: { pipelineId: pipeline.id, name: { contains: 'Lead' } }
      })
      if (!leadStage) {
        leadStage = await prisma.crmPipelineStage.create({
          data: { pipelineId: pipeline.id, name: 'Lead', order: 0, color: '#64748b' }
        })
      }

      const deal = await prisma.crmDeal.create({
        data: {
          userId: prospectUser.id,
          pipelineId: pipeline.id,
          stageId: leadStage.id,
          name: `${booking.prospectName} - ${meetingTypeName}`,
          status: 'OPEN'
        }
      })

      await prisma.crmTask.create({
        data: {
          dealId: deal.id,
          userId: prospectUser.id,
          title: `Booking: ${meetingTypeName}`,
          description: [
            `Scheduled: ${booking.startTime.toISOString()}`,
            `Timezone: ${booking.timezone}`,
            booking.prospectPhone ? `Phone: ${booking.prospectPhone}` : null,
            booking.prospectNotes ? `Notes: ${booking.prospectNotes}` : null
          ]
            .filter(Boolean)
            .join('\n')
        }
      })
    } catch (e) {
      console.error('Failed to create CRM lead:', e)
    }

    // 2. Send confirmation email to prospect
    try {
      const startFormatted = new Intl.DateTimeFormat('en-US', {
        timeZone: booking.timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      }).format(booking.startTime)

      await tasks.trigger('send-email', {
        toEmail: booking.prospectEmail,
        templateKey: 'booking-confirmation',
        eventKey: 'booking-confirmed',
        audience: 'TRANSACTIONAL',
        subject: `Your ${meetingTypeName} with ${coachName ?? 'Journey Endurance'} is Confirmed`,
        props: {
          prospectName: booking.prospectName,
          meetingTypeName,
          startFormatted,
          durationMins: Math.round(
            (booking.endTime.getTime() - booking.startTime.getTime()) / 60000
          ),
          conferenceUrl: conferenceUrl ?? null,
          coachName: coachName ?? 'Journey Endurance',
          cancelUrl: `${process.env.NUXT_PUBLIC_SITE_URL}/book/cancel/${booking.cancelToken}`
        }
      })
    } catch (e) {
      console.error('Failed to send confirmation email:', e)
    }

    return { success: true, bookingId }
  }
})
