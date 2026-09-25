import { buildGarminCoursePayload, createGarminCourse } from '../../../../utils/garmin-push'
import {
  fetchGarminUserPermissions,
  hasGarminPermission,
  parseGarminScope,
  reconcileGarminScopes,
  serializeGarminScopes
} from '../../../../utils/garmin'
import { prisma } from '../../../../utils/db'
import { getServerSession } from '../../../../utils/session'
import { plannedWorkoutPublishRepository } from '../../../../utils/repositories/plannedWorkoutPublishRepository'
import {
  appendPublishStalenessWarning,
  buildPublishWarnings,
  loadPlannedWorkoutPublishContext
} from '../../../../utils/planned-workout-publish-guards'
import { throwPublishPreconditionHttpError } from '../../../../utils/planned-workout-intervals-publish'
import {
  publishPlannedWorkoutToGarmin,
  throwPublishPlannedWorkoutGarminHttpError
} from '../../../../utils/planned-workout-garmin-publish'

type PublishDestination = 'training' | 'course'

function extractCourseGeoPoints(workout: any): any[] {
  const structured = workout?.structuredWorkout as any
  const raw = workout?.rawJson as any

  const candidates = [
    structured?.geoPoints,
    structured?.route?.geoPoints,
    structured?.route?.points,
    raw?.geoPoints,
    raw?.route?.geoPoints,
    raw?.route?.points
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) return candidate
  }
  return []
}

defineRouteMeta({
  openAPI: {
    tags: ['Planned Workouts'],
    summary: 'Publish planned workout to Garmin',
    description: 'Publishes a planned workout to Garmin Training API or Courses API.',
    responses: {
      200: { description: 'Published successfully' },
      400: { description: 'Invalid request or missing permissions' },
      401: { description: 'Unauthorized' },
      404: { description: 'Workout not found' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing workout ID' })

  const body = await readBody<{ destination?: PublishDestination }>(event).catch(() => ({}) as any)
  const destination: PublishDestination = body?.destination === 'course' ? 'course' : 'training'
  const userId = (session.user as any).id as string

  if (destination === 'training') {
    const result = await publishPlannedWorkoutToGarmin(userId, id)
    if (!result.success) throwPublishPlannedWorkoutGarminHttpError(result)
    return result
  }

  const precondition = await loadPlannedWorkoutPublishContext(userId, id)
  if (!precondition.ok) {
    throwPublishPreconditionHttpError(precondition.code, precondition.error, {
      settings_staleness: precondition.settings_staleness
    })
  }

  const { workout, settingsStaleness } = precondition.context

  const integration = await prisma.integration.findFirst({
    where: { userId, provider: 'garmin' }
  })
  if (!integration) {
    throw createError({ statusCode: 400, message: 'Garmin integration not found' })
  }

  let scopes = parseGarminScope(integration.scope)
  if (!hasGarminPermission(scopes, 'COURSE_IMPORT')) {
    try {
      const permissions = await fetchGarminUserPermissions(integration as any)
      scopes = reconcileGarminScopes(scopes, permissions)
      await prisma.integration.update({
        where: { id: integration.id },
        data: {
          scope: serializeGarminScopes(scopes),
          errorMessage: null
        }
      })
    } catch (error) {
      console.warn('[GarminPublish] Failed to fetch permissions from Garmin API', error)
    }
  }
  if (!hasGarminPermission(scopes, 'COURSE_IMPORT')) {
    throw createError({
      statusCode: 400,
      message: 'Garmin COURSE_IMPORT permission is required. Reconnect Garmin and grant permission.'
    })
  }

  const provider = 'garmin_courses'
  try {
    const geoPoints = extractCourseGeoPoints(workout)
    const coursePayload = buildGarminCoursePayload({
      ...workout,
      geoPoints
    })

    const course = await createGarminCourse(integration, coursePayload)
    const courseId = String(course?.courseId || course?.id || '')
    if (!courseId) throw new Error('Garmin course created but no courseId was returned')

    const now = new Date()
    await plannedWorkoutPublishRepository.upsert(id, provider, {
      externalId: courseId,
      status: 'SYNCED',
      error: null,
      lastSyncedAt: now
    })

    return {
      success: true,
      message: appendPublishStalenessWarning(
        'Course published to Garmin Courses API.',
        settingsStaleness
      ),
      destination,
      ...(buildPublishWarnings(settingsStaleness)
        ? { warnings: buildPublishWarnings(settingsStaleness) }
        : {}),
      target: {
        provider,
        externalId: courseId,
        status: 'SYNCED',
        lastSyncedAt: now
      }
    }
  } catch (error: any) {
    await plannedWorkoutPublishRepository.upsert(id, provider, {
      status: 'FAILED',
      error: error?.message || 'Failed to publish to Garmin'
    })

    throw createError({
      statusCode: Number(error?.statusCode) || 500,
      message: error?.message || 'Failed to publish to Garmin'
    })
  }
})
