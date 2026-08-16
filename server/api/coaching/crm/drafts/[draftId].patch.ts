import { getResend } from '../../../../utils/email'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const draftId = event.context.params?.draftId
  if (!draftId) {
    throw createError({ statusCode: 400, message: 'Draft ID is required' })
  }

  if (!user.isCoach && !user.isAdmin) {
    throw createError({ statusCode: 403, message: 'Unauthorized' })
  }

  const body = await readBody(event)

  const draft = await prisma.crmEmailDraft.findUnique({
    where: { id: draftId },
    include: { user: true }
  })

  if (!draft) {
    throw createError({ statusCode: 404, message: 'Draft not found' })
  }

  const updateData: any = {}
  if (body.subject !== undefined) updateData.subject = body.subject
  if (body.body !== undefined) updateData.body = body.body
  if (body.status !== undefined) updateData.status = body.status

  const updatedDraft = await prisma.crmEmailDraft.update({
    where: { id: draftId },
    data: updateData
  })

  // If approved, send it immediately
  if (body.status === 'APPROVED' && draft.status !== 'APPROVED') {
    const resend = getResend()
    if (!resend) {
      throw createError({ statusCode: 500, message: 'Resend API key missing' })
    }

    try {
      await resend.emails.send({
        from: 'Journey Endurance Coaching <onboarding@resend.dev>',
        to: draft.user.email,
        subject: updatedDraft.subject,
        html: `<p>${updatedDraft.body.replace(/\n/g, '<br>')}</p>`
      })

      // Mark as sent
      await prisma.crmEmailDraft.update({
        where: { id: draftId },
        data: { status: 'SENT' }
      })
      updatedDraft.status = 'SENT'
    } catch (e) {
      console.error('Failed to send approved draft:', e)
      throw createError({ statusCode: 500, message: 'Failed to send email' })
    }
  }

  return updatedDraft
})
