import { z } from 'zod'
import { prisma } from '../../utils/db'
import bcrypt from 'bcrypt'

const schema = z.object({
  token: z.string(),
  newPassword: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (b) => schema.safeParse(b))

  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input data'
    })
  }

  const { token, newPassword } = body.data

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  })

  if (!resetToken || resetToken.expires < new Date()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Token is invalid or has expired'
    })
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { email: resetToken.email },
      data: { hashedPassword },
      select: { id: true }
    })

    await tx.passwordResetToken.delete({
      where: { token }
    })

    await tx.session.deleteMany({
      where: { userId: updatedUser.id }
    })
  })

  return { success: true }
})
