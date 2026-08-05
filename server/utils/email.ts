import { Resend } from 'resend'

let resendInstance: Resend | null = null

export const getResend = () => {
  if (resendInstance) return resendInstance

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Only throw if we try to use it and it's missing.
    // This allows the app to start even if key is missing (though email sending will fail)
    console.warn('RESEND_API_KEY is not defined. Email sending will fail.')
    return null
  }

  resendInstance = new Resend(apiKey)
  return resendInstance
}

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  text?: string
}

export const sendEmail = async (options: SendEmailOptions) => {
  const resend = getResend()
  if (!resend) {
    throw new Error('Email configuration missing (RESEND_API_KEY)')
  }

  const from =
    options.from ||
    process.env.MAIL_FROM_ADDRESS ||
    process.env.EMAIL_FROM ||
    'Journey Endurance Coaching <onboarding@resend.dev>'

  const response = await resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text
  })

  if (response.error) {
    throw new Error('Error sending email: ' + response.error.message)
  }

  return response
}

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
      <h2 style="color: #333; text-align: center;">Welcome to the new Journey Endurance Platform!</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Hi there,<br><br>
        We've recently upgraded our platform. To claim your legacy account and set a new password, please click the button below.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Claim Account / Reset Password</a>
      </div>
      <p style="color: #555; font-size: 14px; line-height: 1.5;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${resetLink}" style="color: #0066cc;">${resetLink}</a>
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
        If you did not request this email, please ignore it.
      </p>
    </div>
  `

  return sendEmail({
    to: email,
    subject: 'Claim your Journey Endurance Account',
    html
  })
}
