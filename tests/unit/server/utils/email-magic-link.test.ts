import { describe, expect, it } from 'vitest'
import {
  buildEmailMagicLinkHtml,
  buildEmailMagicLinkUrl,
  emailMagicIdentifier
} from '../../../../server/utils/email-magic-link'

describe('email-magic-link helpers', () => {
  it('builds identifier with prefix', () => {
    expect(emailMagicIdentifier('user-1')).toBe('email-magic:user-1')
  })

  it('builds consume URL with code and optional returnTo', () => {
    expect(
      buildEmailMagicLinkUrl({
        siteUrl: 'https://app.journeyendurance.ca/',
        code: 'abc123'
      })
    ).toBe('https://app.journeyendurance.ca/api/auth/email-magic-link/consume?code=abc123')

    expect(
      buildEmailMagicLinkUrl({
        siteUrl: 'https://app.journeyendurance.ca',
        code: 'abc123',
        returnTo: '/dashboard'
      })
    ).toBe(
      'https://app.journeyendurance.ca/api/auth/email-magic-link/consume?code=abc123&returnTo=%2Fdashboard'
    )
  })

  it('builds email html/text without injecting raw markup from name', () => {
    const { subject, html, text } = buildEmailMagicLinkHtml({
      magicUrl: 'https://app.journeyendurance.ca/api/auth/email-magic-link/consume?code=tok',
      athleteName: 'Alex <script>',
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      siteUrl: 'https://app.journeyendurance.ca'
    })

    expect(subject).toContain('Journey Endurance')
    expect(text).toContain('Alex <script>')
    expect(html).toContain('Alex &lt;script&gt;')
    expect(html).not.toContain('Alex <script>')
    expect(html).toContain('Open Journey Endurance')
  })
})
