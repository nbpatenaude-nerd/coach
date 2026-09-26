import { describe, expect, it } from 'vitest'

import { normalizeStructuredStrengthWorkout } from '../../../../server/utils/strength-exercise-library'

describe('normalizeStructuredStrengthWorkout load modes', () => {
  it('round-trips percent_1rm and rir load modes', () => {
    const result = normalizeStructuredStrengthWorkout({
      schemaVersion: 1,
      blocks: [
        {
          type: 'single_exercise',
          title: 'Main',
          steps: [
            {
              name: 'Back Squat',
              prescriptionMode: 'reps',
              loadMode: 'percent_1rm',
              setRows: [
                { index: 0, value: '5', loadValue: '70' },
                { index: 1, value: '5', loadValue: '75%' }
              ]
            },
            {
              name: 'RDL',
              prescriptionMode: 'reps',
              loadMode: 'rir',
              setRows: [{ index: 0, value: '8', loadValue: '2' }]
            }
          ]
        }
      ]
    })

    const steps = result.blocks[0].steps
    expect(steps[0].loadMode).toBe('percent_1rm')
    expect(steps[0].setRows[0].loadValue).toBe('70')
    expect(steps[0].setRows[1].loadValue).toBe('75%')
    expect(steps[1].loadMode).toBe('rir')
    expect(steps[1].setRows[0].loadValue).toBe('2')
  })

  it('still maps unknown load modes to none', () => {
    const result = normalizeStructuredStrengthWorkout({
      blocks: [
        {
          type: 'single_exercise',
          steps: [
            {
              name: 'Curl',
              loadMode: 'not_a_real_mode',
              setRows: [{ index: 0, value: '10', loadValue: 'x' }]
            }
          ]
        }
      ]
    })

    expect(result.blocks[0].steps[0].loadMode).toBe('none')
  })
})
