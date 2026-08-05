import { z } from 'zod'
import { prisma } from '../../utils/db'
import { sendPasswordResetEmail } from '../../utils/email'

const schema = z.object({
  email: z.string().email()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (b) => schema.safeParse(b))

  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email address'
    })
  }

  const { email } = body.data

  const processReset = async () => {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) return

    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires
      }
    })

    const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3099'
    const resetLink = `${baseUrl}/auth/reset-password?token=${token}`

    await sendPasswordResetEmail(email, resetLink)
  }

  // Fire and forget to prevent timing attacks
  processReset().catch(console.error)

  return { success: true }
})
