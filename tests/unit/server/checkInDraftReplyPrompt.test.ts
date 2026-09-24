import { describe, it, expect } from 'vitest'
import {
  buildCheckInDraftReplyUserPrompt,
  checkInDraftReplySystemPrompt
} from '../../../server/utils/checkInDraftReplyPrompt'

describe('checkInDraftReplyPrompt', () => {
  it('includes voice and no-auto-save constraints in the system prompt', () => {
    expect(checkInDraftReplySystemPrompt).toMatch(/second person/i)
    expect(checkInDraftReplySystemPrompt).toMatch(/video URL/i)
    expect(checkInDraftReplySystemPrompt).not.toMatch(/auto-send|auto save/i)
  })

  it('builds a user prompt with outliers and answers', () => {
    const prompt = buildCheckInDraftReplyUserPrompt({
      athleteName: 'Alex',
      weekStartDate: '2026-09-21',
      responsesBlock: '### Training\n- Load: 8/10',
      outliers: ['Load is high (8/10)']
    })
    expect(prompt).toContain('Alex')
    expect(prompt).toContain('2026-09-21')
    expect(prompt).toContain('Load is high (8/10)')
    expect(prompt).toContain('### Training')
  })

  it('shows a placeholder when no outliers are flagged', () => {
    const prompt = buildCheckInDraftReplyUserPrompt({
      athleteName: 'Sam',
      weekStartDate: '2026-09-14',
      responsesBlock: '### Health\n- Sleep: 7/10',
      outliers: []
    })
    expect(prompt).toContain('(none flagged)')
  })
})
