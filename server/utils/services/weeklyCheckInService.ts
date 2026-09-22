import { toZonedTime, format as formatTz } from 'date-fns-tz'
import { addDays, format } from 'date-fns'
import { prisma } from '../db'
import { getUserTimezone, DEFAULT_TIMEZONE } from '../date'
import {
  DEFAULT_CHECK_IN_FORM,
  DEFAULT_CHECK_IN_FORM_SLUG,
  getCheckInWeekStart,
  getCheckInDeadline,
  weekStartKey,
  validateCheckInResponses,
  type CheckInFormDefinition,
  type CheckInResponses
} from '../../../shared/check-in'

export { DEFAULT_CHECK_IN_FORM_SLUG, getCheckInWeekStart, getCheckInDeadline, weekStartKey }

export async function getActiveCheckInForm() {
  const form = await prisma.checkInForm.findFirst({
    where: { isActive: true },
    orderBy: [{ updatedAt: 'desc' }]
  })

  if (form) return form

  // Fall back to the in-code default so the athlete UI still works before seed.
  return {
    id: null as string | null,
    slug: DEFAULT_CHECK_IN_FORM_SLUG,
    title: 'Weekly Check-In',
    description:
      'Self-report on your training, health, and personal week so your coach can review it alongside your data.',
    sections: DEFAULT_CHECK_IN_FORM.sections,
    isActive: true,
    version: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export function parseFormDefinition(sections: unknown): CheckInFormDefinition {
  if (
    sections &&
    typeof sections === 'object' &&
    Array.isArray((sections as CheckInFormDefinition).sections)
  ) {
    return sections as CheckInFormDefinition
  }
  // Stored shape is the sections array itself (see seed).
  if (Array.isArray(sections)) {
    return { sections: sections as CheckInFormDefinition['sections'] }
  }
  return DEFAULT_CHECK_IN_FORM
}

export async function getCurrentWeeklyCheckIn(athleteId: string) {
  const timezone = (await getUserTimezone(athleteId)) || DEFAULT_TIMEZONE
  const weekStartDate = getCheckInWeekStart(timezone)
  const form = await getActiveCheckInForm()

  const checkIn = await prisma.weeklyCheckIn.findUnique({
    where: {
      athleteId_weekStartDate: { athleteId, weekStartDate }
    }
  })

  const now = new Date()
  const deadline = getCheckInDeadline(weekStartDate, timezone)
  let localNow: Date
  try {
    localNow = toZonedTime(now, timezone)
  } catch {
    localNow = now
  }
  const localWeekday = localNow.getDay() // 0=Sun … 1=Mon
  const isPromptWindow = localWeekday >= 1 && localWeekday <= 2 // Mon–Tue
  const isPastDeadline = now >= deadline

  return {
    weekStartDate: weekStartKey(weekStartDate),
    timezone,
    deadline: deadline.toISOString(),
    isPromptWindow,
    isPastDeadline,
    form: {
      id: form.id,
      slug: form.slug,
      title: form.title,
      description: form.description,
      version: form.version,
      sections: parseFormDefinition(form.sections).sections
    },
    checkIn: checkIn
      ? {
          id: checkIn.id,
          responses: (checkIn.responses ?? {}) as CheckInResponses,
          submittedAt: checkIn.submittedAt.toISOString(),
          updatedAt: checkIn.updatedAt.toISOString(),
          status: checkIn.status,
          coachNotes: checkIn.coachNotes,
          coachVideoUrl: checkIn.coachVideoUrl,
          coachVideoAddedAt: checkIn.coachVideoAddedAt?.toISOString() ?? null,
          coachReviewedAt: checkIn.coachReviewedAt?.toISOString() ?? null
        }
      : null
  }
}

export async function upsertWeeklyCheckIn(
  athleteId: string,
  rawResponses: Record<string, unknown>
) {
  const timezone = (await getUserTimezone(athleteId)) || DEFAULT_TIMEZONE
  const weekStartDate = getCheckInWeekStart(timezone)
  const formRow = await getActiveCheckInForm()
  const formDef = parseFormDefinition(formRow.sections)
  const validated = validateCheckInResponses(formDef, rawResponses)

  if (!validated.ok) {
    throw createError({
      statusCode: 400,
      message: validated.errors.join('; '),
      data: { errors: validated.errors }
    })
  }

  let formId = formRow.id
  if (!formId) {
    const seeded = await prisma.checkInForm.findUnique({
      where: { slug: DEFAULT_CHECK_IN_FORM_SLUG }
    })
    formId = seeded?.id ?? null
  }

  const checkIn = await prisma.weeklyCheckIn.upsert({
    where: {
      athleteId_weekStartDate: { athleteId, weekStartDate }
    },
    create: {
      athleteId,
      formId,
      weekStartDate,
      responses: validated.responses,
      status: 'SUBMITTED',
      submittedAt: new Date()
    },
    update: {
      responses: validated.responses,
      formId: formId ?? undefined,
      updatedAt: new Date()
      // Do not clear coach feedback on resubmit — coach video stays attached.
    }
  })

  return checkIn
}

export async function getAthleteCheckInHistory(
  athleteId: string,
  options: { days?: number; limit?: number } = {}
) {
  const days = options.days ?? 90
  const limit = options.limit ?? 52
  const since = addDays(new Date(), -days)

  const rows = await prisma.weeklyCheckIn.findMany({
    where: {
      athleteId,
      weekStartDate: { gte: since }
    },
    orderBy: { weekStartDate: 'asc' },
    take: limit,
    include: {
      form: { select: { id: true, slug: true, title: true, sections: true, version: true } }
    }
  })

  return rows.map((row) => ({
    id: row.id,
    weekStartDate: weekStartKey(row.weekStartDate),
    submittedAt: row.submittedAt.toISOString(),
    status: row.status,
    responses: (row.responses ?? {}) as CheckInResponses,
    coachNotes: row.coachNotes,
    coachVideoUrl: row.coachVideoUrl,
    coachVideoAddedAt: row.coachVideoAddedAt?.toISOString() ?? null,
    coachReviewedAt: row.coachReviewedAt?.toISOString() ?? null,
    form: row.form
      ? {
          id: row.form.id,
          slug: row.form.slug,
          title: row.form.title,
          version: row.form.version,
          sections: parseFormDefinition(row.form.sections).sections
        }
      : null
  }))
}

/** Format a local weekday name for prompts (debug / email copy). */
export function formatLocalWeekday(timezone: string, now: Date = new Date()): string {
  try {
    return formatTz(toZonedTime(now, timezone), 'EEEE', { timeZone: timezone })
  } catch {
    return format(now, 'EEEE')
  }
}
