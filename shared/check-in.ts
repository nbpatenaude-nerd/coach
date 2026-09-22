/**
 * Weekly check-in form contract.
 *
 * The active form lives in the `CheckInForm` table as JSON so questions can be
 * changed without a migration; this file is the type contract plus the seeded
 * default (`DEFAULT_CHECK_IN_FORM`), ported from the legacy Journey Endurance
 * check-in. Submissions store `responses` keyed by `CheckInField.id`.
 *
 * Field ids keep their legacy names so historical Firestore data imports
 * cleanly. Category is carried by the *section*, not the id prefix — that is
 * what allows a field to move between sections (e.g. `personal_fatigue` now
 * lives under Health) without rewriting stored responses.
 */

export type CheckInFieldType = 'rating' | 'number' | 'text' | 'paragraph' | 'yes_no' | 'select'

/**
 * Which direction is a good trend for this field. Drives chart axis semantics
 * and the coach review colouring — a rising fatigue line and a rising sleep
 * line must not read the same way.
 */
export type CheckInFieldDirection = 'higher_is_better' | 'lower_is_better' | 'neutral'

export type CheckInSectionKey = 'training' | 'health' | 'personal'

export interface CheckInField {
  id: string
  label: string
  /** Compact label for chart legends and table headers. */
  shortTitle: string
  type: CheckInFieldType
  required?: boolean
  /** `rating` / `number` only. */
  min?: number
  max?: number
  direction?: CheckInFieldDirection
  /** Anchor captions shown at each end of a rating slider. */
  minLabel?: string
  maxLabel?: string
  placeholder?: string
  /** `select` only. */
  options?: string[]
}

export interface CheckInSection {
  key: CheckInSectionKey
  heading: string
  description?: string
  fields: CheckInField[]
}

export interface CheckInFormDefinition {
  sections: CheckInSection[]
}

/** A single submitted answer. */
export type CheckInResponseValue = string | number | boolean | null
export type CheckInResponses = Record<string, CheckInResponseValue>

export const CHECK_IN_RATING_MIN = 1
export const CHECK_IN_RATING_MAX = 10

/** Slug of the seeded default form. */
export const DEFAULT_CHECK_IN_FORM_SLUG = 'journey-weekly-check-in'

/**
 * Section accent colours, carried over from the legacy check-in charts so
 * imported history keeps the same visual language.
 */
export const CHECK_IN_SECTION_COLORS: Record<CheckInSectionKey, string[]> = {
  training: ['#00A8FF', '#3B82F6', '#0EA5E9', '#6366F1', '#8B5CF6'],
  health: ['#F59E0B', '#F97316', '#EAB308', '#FBBF24'],
  personal: ['#EF4444', '#EC4899', '#F43F5E', '#DB2777']
}

export const DEFAULT_CHECK_IN_FORM: CheckInFormDefinition = {
  sections: [
    {
      key: 'training',
      heading: 'Training',
      description: 'How the week’s training landed.',
      fields: [
        {
          id: 'training_load',
          label: 'Training Load',
          shortTitle: 'Load',
          type: 'rating',
          required: true,
          min: CHECK_IN_RATING_MIN,
          max: CHECK_IN_RATING_MAX,
          direction: 'neutral',
          minLabel: 'Light',
          maxLabel: 'Heavy'
        },
        {
          id: 'training_difficulty',
          label: 'Training Difficulty',
          shortTitle: 'Difficulty',
          type: 'rating',
          required: true,
          min: CHECK_IN_RATING_MIN,
          max: CHECK_IN_RATING_MAX,
          direction: 'neutral',
          minLabel: 'Easy',
          maxLabel: 'Brutal'
        },
        {
          id: 'training_hydration',
          label: 'Hydration',
          shortTitle: 'Hydration',
          type: 'rating',
          required: true,
          min: CHECK_IN_RATING_MIN,
          max: CHECK_IN_RATING_MAX,
          direction: 'higher_is_better',
          minLabel: 'Poor',
          maxLabel: 'Excellent'
        },
        {
          id: 'training_nutrition',
          label: 'Nutrition',
          shortTitle: 'Nutrition',
          type: 'rating',
          required: true,
          min: CHECK_IN_RATING_MIN,
          max: CHECK_IN_RATING_MAX,
          direction: 'higher_is_better',
          minLabel: 'Poor',
          maxLabel: 'Excellent'
        },
        {
          id: 'training_recovery',
          label: 'Recovery',
          shortTitle: 'Recovery',
          type: 'rating',
          required: true,
          min: CHECK_IN_RATING_MIN,
          max: CHECK_IN_RATING_MAX,
          direction: 'higher_is_better',
          minLabel: 'Poor',
          maxLabel: 'Excellent'
        }
      ]
    },
    {
      key: 'health',
      heading: 'Health',
      description: 'Sleep, stress, fatigue, and anything physically wrong.',
      fields: [
        {
          id: 'wellness_sleep',
          label: 'Sleep Quality',
          shortTitle: 'Sleep',
          type: 'rating',
          required: true,
          min: CHECK_IN_RATING_MIN,
          max: CHECK_IN_RATING_MAX,
          direction: 'higher_is_better',
          minLabel: 'Terrible',
          maxLabel: 'Perfect'
        },
        {
          id: 'wellness_stress',
          label: 'Stress Levels',
          shortTitle: 'Stress',
          type: 'rating',
          required: true,
          min: CHECK_IN_RATING_MIN,
          max: CHECK_IN_RATING_MAX,
          direction: 'lower_is_better',
          minLabel: 'Calm',
          maxLabel: 'Overwhelmed'
        },
        {
          id: 'personal_fatigue',
          label: 'Fatigue',
          shortTitle: 'Fatigue',
          type: 'rating',
          required: true,
          min: CHECK_IN_RATING_MIN,
          max: CHECK_IN_RATING_MAX,
          direction: 'lower_is_better',
          minLabel: 'Fresh',
          maxLabel: 'Exhausted'
        },
        {
          id: 'wellness_pain_score',
          label: 'Pain / Soreness',
          shortTitle: 'Pain',
          type: 'rating',
          required: true,
          min: CHECK_IN_RATING_MIN,
          max: CHECK_IN_RATING_MAX,
          direction: 'lower_is_better',
          minLabel: 'None',
          maxLabel: 'Severe'
        },
        {
          id: 'wellness_injury',
          label: 'Reported Injuries',
          shortTitle: 'Injuries',
          type: 'paragraph',
          placeholder: 'Describe any specific injuries…'
        },
        {
          id: 'wellness_pain',
          label: 'Pain / Soreness Detail',
          shortTitle: 'Pain Detail',
          type: 'paragraph',
          placeholder: 'Where is it, and when does it show up?'
        }
      ]
    },
    {
      key: 'personal',
      heading: 'Personal',
      description: 'Context your coach can’t see in the data.',
      fields: [
        {
          id: 'personal_notes',
          label: 'Personal Notes',
          shortTitle: 'Notes',
          type: 'paragraph',
          placeholder: 'Any general thoughts or feelings on your training…'
        },
        {
          id: 'personal_challenges',
          label: 'Current Challenges',
          shortTitle: 'Challenges',
          type: 'paragraph',
          placeholder: 'What’s holding you back right now?'
        },
        {
          id: 'personal_goals',
          label: 'Upcoming Goals',
          shortTitle: 'Goals',
          type: 'paragraph',
          placeholder: 'What are we pushing for?'
        },
        {
          id: 'personal_highlights',
          label: 'Weekly Highlights',
          shortTitle: 'Highlights',
          type: 'paragraph',
          placeholder: 'What went well?'
        }
      ]
    }
  ]
}

/** Flatten a form definition to its fields, in display order. */
export function checkInFields(form: CheckInFormDefinition): CheckInField[] {
  return form.sections.flatMap((section) => section.fields)
}

/** Fields that produce a plottable number. */
export function checkInNumericFields(form: CheckInFormDefinition): CheckInField[] {
  return checkInFields(form).filter((field) => field.type === 'rating' || field.type === 'number')
}

/** Look up which section a field belongs to. */
export function checkInSectionForField(
  form: CheckInFormDefinition,
  fieldId: string
): CheckInSection | undefined {
  return form.sections.find((section) => section.fields.some((field) => field.id === fieldId))
}

/**
 * Stable accent colour for a field, derived from its *section* rather than its
 * id prefix so moving a field between sections recolours it correctly.
 */
export function checkInFieldColor(form: CheckInFormDefinition, fieldId: string): string {
  const section = checkInSectionForField(form, fieldId)
  if (!section) return CHECK_IN_SECTION_COLORS.training[0]!

  const palette = CHECK_IN_SECTION_COLORS[section.key]
  const numericIndex = section.fields
    .filter((field) => field.type === 'rating' || field.type === 'number')
    .findIndex((field) => field.id === fieldId)
  const index = numericIndex >= 0 ? numericIndex : section.fields.findIndex((f) => f.id === fieldId)

  return palette[Math.max(index, 0) % palette.length]!
}

/** Coerce a stored response to a number, or null when not numeric. */
export function checkInNumericValue(value: CheckInResponseValue): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/**
 * Monday of the athlete's local week as a UTC-midnight Date (Prisma `@db.Date`
 * convention). `now` is the instant being evaluated; `timezone` is IANA.
 */
export function getCheckInWeekStart(timezone: string = 'UTC', now: Date = new Date()): Date {
  // Inline the calendar math so this module stays dependency-light for clients.
  // Format the zoned YYYY-MM-DD via Intl, then walk back to Monday.
  let dateStr: string
  try {
    dateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now)
  } catch {
    dateStr = now.toISOString().slice(0, 10)
  }

  // en-CA yields YYYY-MM-DD
  const [y, m, d] = dateStr.split('-').map(Number)
  const localMidnight = new Date(Date.UTC(y!, m! - 1, d!))
  const weekday = localMidnight.getUTCDay() // 0=Sun … 1=Mon
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1
  localMidnight.setUTCDate(localMidnight.getUTCDate() - daysFromMonday)
  return localMidnight
}

export function weekStartKey(weekStart: Date): string {
  return weekStart.toISOString().slice(0, 10)
}

/**
 * Wednesday 00:00 in the athlete's timezone as a real UTC instant — the
 * coach-review cutoff. Athletes should submit before this.
 */
export function getCheckInDeadline(weekStart: Date, timezone: string): Date {
  const mondayKey = weekStartKey(weekStart)
  const [y, m, d] = mondayKey.split('-').map(Number)
  const wed = new Date(Date.UTC(y!, m! - 1, d! + 2))
  const wedKey = wed.toISOString().slice(0, 10)

  // Build "Wednesday 00:00 in timezone" → UTC by binary-searching an offset
  // via Intl (avoids pulling date-fns-tz into the shared bundle).
  try {
    const probe = new Date(`${wedKey}T12:00:00Z`)
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    }).formatToParts(probe)
    const tzName = parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT'
    const match = tzName.match(/GMT([+-])(\d+)(?::(\d+))?/)
    if (match) {
      const sign = match[1] === '-' ? -1 : 1
      const hours = Number(match[2])
      const mins = Number(match[3] || 0)
      const offsetMs = sign * (hours * 60 + mins) * 60_000
      // Local midnight = UTC midnight - offset
      return new Date(new Date(`${wedKey}T00:00:00Z`).getTime() - offsetMs)
    }
  } catch {
    // fall through
  }
  return new Date(`${wedKey}T00:00:00Z`)
}

function validateFieldValue(field: CheckInField, value: CheckInResponseValue): string | null {
  const empty =
    value === null || value === undefined || (typeof value === 'string' && value.trim() === '')

  if (field.required && empty) return `${field.label} is required`
  if (empty) return null

  if (field.type === 'rating' || field.type === 'number') {
    const numeric = checkInNumericValue(value)
    if (numeric === null) return `${field.label} must be a number`
    const min = field.min ?? 1
    const max = field.max ?? 10
    if (numeric < min || numeric > max) {
      return `${field.label} must be between ${min} and ${max}`
    }
  }

  if (
    field.type === 'yes_no' &&
    value !== 'Yes' &&
    value !== 'No' &&
    value !== true &&
    value !== false
  ) {
    return `${field.label} must be Yes or No`
  }

  if (field.type === 'select' && field.options && !field.options.includes(String(value))) {
    return `${field.label} must be one of: ${field.options.join(', ')}`
  }

  return null
}

export type CheckInValidationResult =
  { ok: true; responses: CheckInResponses } | { ok: false; errors: string[] }

/** Validate and coerce a responses map against a form definition. */
export function validateCheckInResponses(
  form: CheckInFormDefinition,
  raw: Record<string, unknown>
): CheckInValidationResult {
  const fields = checkInFields(form)
  const errors: string[] = []
  const responses: CheckInResponses = {}

  for (const field of fields) {
    const rawValue = raw[field.id]
    let value: CheckInResponseValue =
      rawValue === undefined ? null : (rawValue as CheckInResponseValue)

    if (field.type === 'rating' || field.type === 'number') {
      value = checkInNumericValue(value)
    } else if (typeof value === 'string') {
      value = value.trim() || null
    }

    const error = validateFieldValue(field, value)
    if (error) errors.push(error)
    else if (value !== null && value !== undefined) responses[field.id] = value
  }

  if (errors.length) return { ok: false, errors }
  return { ok: true, responses }
}

/**
 * Normalise a rating to 0-1 where 1 is always "good", so mixed-direction
 * fields can be compared or averaged. Returns null for `neutral` fields and
 * non-numeric values, because "good" is undefined for them.
 */
export function checkInNormalizedScore(
  field: CheckInField,
  value: CheckInResponseValue
): number | null {
  const numeric = checkInNumericValue(value)
  if (numeric === null) return null
  if (!field.direction || field.direction === 'neutral') return null

  const min = field.min ?? CHECK_IN_RATING_MIN
  const max = field.max ?? CHECK_IN_RATING_MAX
  if (max === min) return null

  const ratio = (numeric - min) / (max - min)
  const clamped = Math.min(Math.max(ratio, 0), 1)
  return field.direction === 'lower_is_better' ? 1 - clamped : clamped
}
