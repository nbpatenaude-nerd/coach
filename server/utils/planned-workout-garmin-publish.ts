import { prisma } from './db'
import {
  createGarminWorkout,
  createGarminWorkoutSchedule,
  updateGarminWorkout,
  updateGarminWorkoutSchedule,
  extractGarminScheduleId
} from './garmin-push'
import {
  fetchGarminUserPermissions,
  hasGarminPermission,
  parseGarminScope,
  reconcileGarminScopes,
  serializeGarminScopes
} from './garmin'
import { plannedWorkoutPublishRepository } from './repositories/plannedWorkoutPublishRepository'
import { serializeCanonicalForGarmin } from './canonical-workout-serializer'
import {
  appendPublishStalenessWarning,
  buildPublishWarnings,
  loadPlannedWorkoutPublishContext
} from './planned-workout-publish-guards'
import type { SettingsStaleness } from '../../shared/workout-settings-staleness'
import type { PublishPlannedWorkoutIntervalsCode } from './planned-workout-intervals-publish'

export type PublishPlannedWorkoutGarminCode =
  PublishPlannedWorkoutIntervalsCode | 'missing_permission'

export type PublishPlannedWorkoutToGarminSuccess = {
  success: true
  message: string
  action: 'created' | 'updated' | 'recreated'
  destination: 'training'
  warnings?: {
    settings_staleness?: SettingsStaleness
  }
  target: {
    provider: 'garmin_training'
    externalId: string
    scheduleId: string | null
    status: 'SYNCED'
    lastSyncedAt: Date
  }
}

export type PublishPlannedWorkoutToGarminFailure = {
  success: false
  code: PublishPlannedWorkoutGarminCode
  error: string
  diagnostics?: unknown
  settings_staleness?: SettingsStaleness
}

export type PublishPlannedWorkoutToGarminResult =
  PublishPlannedWorkoutToGarminSuccess | PublishPlannedWorkoutToGarminFailure

function toDateOnly(value: Date): string {
  return value.toISOString().split('T')[0]!
}

function isStaleGarminWorkoutError(error: any): boolean {
  const message = String(error?.message || '')
  return (
    message.includes('(404)') ||
    (message.includes('requires') && message.includes('ownerId')) ||
    message.includes('requires numeric workoutId') ||
    message.includes('not a valid `java.lang.Long`') ||
    message.includes("doesn't match with null") ||
    message.includes('has no steps') ||
    error?.code === 'GARMIN_OWNER_ID_REQUIRED' ||
    error?.code === 'GARMIN_WORKOUT_ID_INVALID'
  )
}

/** Shared Garmin Training API publish/update path for HTTP routes and auto-sync. */
export async function publishPlannedWorkoutToGarmin(
  userId: string,
  workoutId: string
): Promise<PublishPlannedWorkoutToGarminResult> {
  const precondition = await loadPlannedWorkoutPublishContext(userId, workoutId)
  if (!precondition.ok) {
    return {
      success: false,
      code: precondition.code,
      error: precondition.error,
      ...(precondition.settings_staleness
        ? { settings_staleness: precondition.settings_staleness }
        : {})
    }
  }

  const { workout, sportSettings, settingsStaleness } = precondition.context

  const integration = await prisma.integration.findFirst({
    where: { userId, provider: 'garmin' }
  })
  if (!integration) {
    return {
      success: false,
      code: 'no_integration',
      error: 'Garmin integration not found'
    }
  }

  let scopes = parseGarminScope(integration.scope)
  if (!hasGarminPermission(scopes, 'WORKOUT_IMPORT')) {
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

  if (!hasGarminPermission(scopes, 'WORKOUT_IMPORT')) {
    return {
      success: false,
      code: 'missing_permission',
      error: 'Garmin WORKOUT_IMPORT permission is required. Reconnect Garmin and grant permission.'
    }
  }

  const provider = 'garmin_training' as const
  const existingTarget = await plannedWorkoutPublishRepository.getByProvider(workoutId, provider)

  let payload: Record<string, unknown>
  try {
    payload = serializeCanonicalForGarmin({
      title: workout.title,
      description: workout.description || '',
      type: workout.type,
      structure: workout.structuredWorkout,
      zoneProfileSnapshot: (workout.structuredWorkout as any)?.zoneProfileSnapshot,
      durationSec: workout.durationSec,
      distanceMeters: workout.distanceMeters,
      sourceId: workout.id,
      workout,
      liveSportSettings: sportSettings
    }) as Record<string, unknown>
  } catch (error: any) {
    return {
      success: false,
      code: 'export_blocked',
      error: error?.message || 'Workout cannot be exported to Garmin.',
      diagnostics: error?.data?.issues || error?.data?.diagnostics,
      settings_staleness: settingsStaleness.stale ? settingsStaleness : undefined
    }
  }

  try {
    let action: 'created' | 'updated' | 'recreated' = 'created'
    let garminWorkoutId = existingTarget?.externalId || null

    if (garminWorkoutId) {
      try {
        await updateGarminWorkout(integration, garminWorkoutId, payload)
        action = 'updated'
      } catch (e: any) {
        if (!isStaleGarminWorkoutError(e)) throw e
        garminWorkoutId = null
      }
    }

    if (!garminWorkoutId) {
      const created = await createGarminWorkout(integration, payload)
      garminWorkoutId = String(created?.workoutId || created?.id || '')
      action = existingTarget?.externalId ? 'recreated' : 'created'
    }

    if (!garminWorkoutId) {
      throw new Error('Garmin workout created but no workoutId was returned')
    }

    const schedulePayload = {
      workoutId: Number(garminWorkoutId),
      date: toDateOnly(workout.date)
    }

    let scheduleId = existingTarget?.scheduleId || null
    if (scheduleId) {
      try {
        await updateGarminWorkoutSchedule(integration, scheduleId, schedulePayload)
      } catch (e: any) {
        if (String(e?.message || '').includes('(404)')) {
          scheduleId = null
        } else {
          throw e
        }
      }
    }
    if (!scheduleId) {
      const createdSchedule = await createGarminWorkoutSchedule(integration, schedulePayload)
      scheduleId = extractGarminScheduleId(createdSchedule)
    }

    const now = new Date()
    await plannedWorkoutPublishRepository.upsert(workoutId, provider, {
      externalId: garminWorkoutId,
      scheduleId,
      status: 'SYNCED',
      error: null,
      lastSyncedAt: now
    })

    const message = appendPublishStalenessWarning(
      action === 'updated'
        ? 'Workout updated on Garmin.'
        : action === 'recreated'
          ? 'Workout recreated on Garmin.'
          : 'Workout published to Garmin Training API.',
      settingsStaleness
    )

    return {
      success: true,
      message,
      action,
      destination: 'training',
      ...(buildPublishWarnings(settingsStaleness)
        ? { warnings: buildPublishWarnings(settingsStaleness) }
        : {}),
      target: {
        provider,
        externalId: garminWorkoutId,
        scheduleId,
        status: 'SYNCED',
        lastSyncedAt: now
      }
    }
  } catch (error: any) {
    await plannedWorkoutPublishRepository.upsert(workoutId, provider, {
      status: 'FAILED',
      error: error?.message || 'Failed to publish to Garmin'
    })
    return {
      success: false,
      code: 'publish_failed',
      error: error?.message || 'Failed to publish to Garmin',
      settings_staleness: settingsStaleness.stale ? settingsStaleness : undefined
    }
  }
}

/**
 * Best-effort auto publish after local create/update.
 * Never throws — Garmin outages must not block saving the planned workout.
 */
export async function maybeAutoPublishPlannedWorkoutToGarmin(
  userId: string,
  workoutId: string
): Promise<PublishPlannedWorkoutToGarminResult | null> {
  try {
    const result = await publishPlannedWorkoutToGarmin(userId, workoutId)
    if (
      !result.success &&
      result.code !== 'no_integration' &&
      result.code !== 'no_structure' &&
      result.code !== 'generation_in_flight' &&
      result.code !== 'missing_permission'
    ) {
      console.warn('[GarminAutoPublish]', workoutId, result.code, result.error)
    }
    return result
  } catch (error) {
    console.error('[GarminAutoPublish] unexpected failure', workoutId, error)
    return null
  }
}

export function throwPublishPlannedWorkoutGarminHttpError(
  result: PublishPlannedWorkoutToGarminFailure
): never {
  const statusByCode: Record<PublishPlannedWorkoutGarminCode, number> = {
    not_found: 404,
    no_integration: 400,
    no_structure: 422,
    generation_in_flight: 409,
    sync_conflict: 409,
    export_blocked: 422,
    publish_failed: 500,
    missing_permission: 400
  }

  throw createError({
    statusCode: statusByCode[result.code] || 500,
    message: result.error,
    data: {
      code: result.code,
      diagnostics: result.diagnostics,
      settings_staleness: result.settings_staleness
    }
  })
}
