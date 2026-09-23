import { Command } from 'commander'
import chalk from 'chalk'
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import {
  EMAIL_MAGIC_LINK_TTL_SECONDS,
  buildEmailMagicLinkHtml,
  buildEmailMagicLinkUrl,
  createEmailMagicLink
} from '../../server/utils/email-magic-link'
import { sendEmail } from '../../server/utils/email'
import { sanitizeReturnTo } from '../../server/utils/app-web-handoff'

const magicLinkCommand = new Command('magic-link')
  .description(
    'Mint a one-time email magic link that signs an existing user into the web app (legacy athlete bridge)'
  )
  .argument('<email>', 'User email address')
  .option('--prod', 'Use production database (DATABASE_URL_PROD)')
  .option('--send', 'Also send the link via Resend to the user')
  .option(
    '--ttl-hours <hours>',
    'Link lifetime in hours (default 72, max 720)',
    String(EMAIL_MAGIC_LINK_TTL_SECONDS / 3600)
  )
  .option('--return-to <path>', 'Post-login path', '/dashboard')
  .option(
    '--site-url <url>',
    'App origin used in the link (must be where auth runs, e.g. app.journeyendurance.ca)',
    process.env.NUXT_PUBLIC_SITE_URL || 'https://app.journeyendurance.ca'
  )
  .action(async (emailArg, options) => {
    const email = String(emailArg || '')
      .trim()
      .toLowerCase()
    if (!email || !email.includes('@')) {
      console.error(chalk.red('Error: provide a valid email address.'))
      process.exit(1)
    }

    const isProd = Boolean(options.prod)
    const connectionString = isProd ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL
    const ttlHours = Number(options.ttlHours)
    if (!Number.isFinite(ttlHours) || ttlHours < 1 / 60 || ttlHours > 720) {
      console.error(chalk.red('Error: --ttl-hours must be between ~0.02 and 720.'))
      process.exit(1)
    }
    const ttlSeconds = Math.round(ttlHours * 3600)
    const returnTo = sanitizeReturnTo(options.returnTo, '/dashboard')
    const siteUrl = String(options.siteUrl || '').replace(/\/$/, '')

    if (isProd) {
      console.log(chalk.yellow('⚠️  Using PRODUCTION database.'))
    } else {
      console.log(chalk.blue('Using DEVELOPMENT database.'))
    }

    if (!connectionString) {
      console.error(chalk.red('Error: Database connection string is not defined.'))
      if (isProd) {
        console.error(chalk.red('Make sure DATABASE_URL_PROD is set in .env'))
      } else {
        console.error(chalk.red('Make sure DATABASE_URL is set in .env'))
      }
      process.exit(1)
    }

    if (!siteUrl) {
      console.error(
        chalk.red('Error: site URL is empty. Pass --site-url or set NUXT_PUBLIC_SITE_URL.')
      )
      process.exit(1)
    }

    const pool = new pg.Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, deactivatedAt: true }
      })

      if (!user) {
        console.error(chalk.red(`❌ User not found: ${email}`))
        process.exit(1)
      }
      if (user.deactivatedAt) {
        console.error(chalk.red(`❌ User is deactivated: ${email}`))
        process.exit(1)
      }

      const { code, expiresAt } = await createEmailMagicLink(user.id, ttlSeconds, prisma)
      const magicUrl = buildEmailMagicLinkUrl({ siteUrl, code, returnTo })

      console.log(chalk.green('✅ Magic link generated'))
      console.log(`User: ${chalk.bold(user.name || user.email)}`)
      console.log(`Email: ${user.email}`)
      console.log(`Expires: ${chalk.bold(expiresAt.toISOString())} (${ttlHours}h)`)
      console.log(`Return to: ${returnTo}`)
      console.log('')
      console.log(chalk.cyan(chalk.bold(magicUrl)))
      console.log('')
      console.log(chalk.gray('One-time use. Generating again invalidates this link.'))

      if (options.send) {
        if (process.env.CW_DISABLE_EMAILS === '1') {
          console.error(chalk.red('CW_DISABLE_EMAILS=1 — refusing to send.'))
          process.exit(1)
        }
        const { subject, html, text } = buildEmailMagicLinkHtml({
          magicUrl,
          athleteName: user.name,
          expiresAt,
          siteUrl
        })
        await sendEmail({ to: user.email!, subject, html, text })
        console.log(chalk.green(`📧 Sent to ${user.email}`))
      } else {
        console.log(chalk.gray('Tip: add --send to email this link via Resend.'))
      }
    } catch (error: any) {
      console.error(chalk.red('❌ Error generating magic link:'), error?.message || error)
      process.exit(1)
    } finally {
      await prisma.$disconnect()
      await pool.end()
    }
  })

export default magicLinkCommand
