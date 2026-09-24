import { prisma } from './db'
import { sportSettingsRepository } from './repositories/sportSettingsRepository'
import { syncPlannedWorkoutToIntervals } from './intervals-sync'
import { serializeCanonicalForIntervals } from './canonical-workout-serializer'
import { buildStructurePublishFields } from './planned-workout-structure-sync'
import { hasActiveStructureGenerationRun } from './structure-generation-run'
import {
  adaptStructuredWorkout,
  createZoneProfileSnapshot,
  validateStructuredWorkoutLimits,
  type ZoneProfileSnapshot
} from '../../shared/structured-workout-contract'
import {
  assessWorkoutSettingsStaleness,
  type SettingsStaleness
} from '../../shared/workout-settings-staleness'
import { WorkoutParser } from './workout-parser'
import { normalizeStructuredWorkoutForPersistence } from './structured-workout-persistence'
import { normalizeStructuredStrengthWorkout } from './strength-exercise-library'
import { writeCanonicalPlannedWorkoutStructure } from './canonical-planned-workout-write'
import { resolveWorkoutTargeting } from '../../trigger/utils/workout-targeting'

export type ManualStructureSyncStatus = 'LOCAL_ONLY' | 'SYNCED' | 'PENDING'

export type PlannedWorkoutOperationalContext = {
  sync_conflict: boolean
  has_pending_remote_structure: boolean
  structure_generation_in_flight: boolean
  settings_staleness: SettingsStaleness
  has_unresolved_targets: boolean
  structure_source: string | null
  unresolved_diagnostics_count: number
}

export function resolveManualEditZoneProfileSnapshot(options: {
  existingStructuredWorkout?: unknown
  sportSettings: any
  rebaseZones?: boolean
}) {
  if (options.rebaseZones) {
    return createZoneProfileSnapshot(options.sportSettings)
  }

  return (
    (options.existingStructuredWorkout as any)?.zoneProfileSnapshot ||
    createZoneProfileSnapshot(options.sportSettings)
  )
}

export async function buildPlannedWorkoutOperationalContext(
  userId: string,
  workout: {
    id: string
    type?: string | null
    syncConflict?: boolean | null
    pendingRemoteStructuredWorkout?: unknown
    lastGenerationSettingsSnapshot?: unknown
    createdFromSettingsSnapshot?: unknown
    structuredWorkout?: unknown
    user?: { ftp?: number | null } | null
  }
): Promise<PlannedWorkoutOperationalContext> {
  const sportSettings = await sportSettingsRepository.getForActivityType(userId, workout.type || '')
  const settingsStaleness = assessWorkoutSettingsStaleness({
    workoutType: workout.type,
    lastGenerationSettingsSnapshot: workout.lastGenerationSettingsSnapshot,
    createdFromSettingsSnapshot: workout.createdFromSettingsSnapshot,
    liveSportSettings: sportSettings,
    liveUserFtp: workout.user?.ftp
  })
  const structured = workout.structuredWorkout as any
  const diagnostics = Array.isArray(structured?.diagnostics) ? structured.diagnostics : []

  return {
    sync_conflict: Boolean(workout.syncConflict),
    has_pending_remote_structure: Boolean(workout.pendingRemoteStructuredWorkout),
    structure_generation_in_flight: await hasActiveStructureGenerationRun(workout.id),
    settings_staleness: settingsStaleness,
    has_unresolved_targets: diagnostics.length > 0,
    structure_source: typeof structured?.source === 'string' ? structured.source : null,
    unresolved_diagnostics_count: diagnostics.length
  }
}

export async function syncManualPlannedWorkoutStructureToIntervalsIfSynced(options: {
  userId: string
  plannedWorkoutId: string
  priorSyncStatus: string | null | undefined
  updatedWorkout: {
    title: string
    description?: string | null
    type?: string | null
    structuredWorkout?: unknown
    lastGenerationSettingsSnapshot?: unknown
    createdFromSettingsSnapshot?: unknown
    [key: string]: unknown
  }
  canonical: {
    zoneProfileSnapshot?: unknown
    [key: string]: unknown
  }
  sportSettings: any
  liveUserFtp?: number | null
}): Promise<{ synced: boolean; sync_status: ManualStructureSyncStatus }> {
  if (options.priorSyncStatus === 'LOCAL_ONLY') {
    return { synced: false, sync_status: 'LOCAL_ONLY' }
  }

  if (options.priorSyncStatus !== 'SYNCED') {
    return { synced: false, sync_status: 'PENDING' }
  }

  const syncText = serializeCanonicalForIntervals({
    title: options.updatedWorkout.title,
    description: options.updatedWorkout.description || '',
    type: options.updatedWorkout.type,
    structure: options.canonical,
    zoneProfileSnapshot: options.canonical.zoneProfileSnapshot as ZoneProfileSnapshot | undefined,
    workout: options.updatedWorkout,
    liveSportSettings: options.sportSettings,
    liveUserFtp: options.liveUserFtp
  })

  const syncResult = await syncPlannedWorkoutToIntervals(
    'UPDATE',
    {
      ...options.updatedWorkout,
      workout_doc: syncText
    },
    options.userId
  )

  if (syncResult.synced) {
    await prisma.plannedWorkout.update({
      where: { id: options.plannedWorkoutId },
      data: {
        ...buildStructurePublishFields(options.updatedWorkout.structuredWorkout),
        syncStatus: 'SYNCED',
        lastSyncedAt: new Date(),
        syncError: null
      }
    })
    return { synced: true, sync_status: 'SYNCED' }
  }

  return { synced: false, sync_status: 'PENDING' }
}

export function buildManualStructureEditStatusMessage(options: {
  sync_status: ManualStructureSyncStatus
  intervals_synced: boolean
  zone_profile_rebased?: boolean
}) {
  if (options.zone_profile_rebased) {
    return 'Planned workout structure updated with current sport settings zones.'
  }

  if (options.intervals_synced) {
    return 'Planned workout structure updated and pushed to Intervals.icu.'
  }

  if (options.sync_status === 'LOCAL_ONLY') {
    return 'Planned workout structure updated locally. Publish to Intervals.icu when you are ready.'
  }

  if (options.sync_status === 'PENDING') {
    return 'Planned workout structure updated locally. Intervals.icu sync is pending — publish when ready.'
  }

  return 'Planned workout structure updated.'
}

export type ManualStructureEditBody = {
  text?: unknown
  steps?: unknown
  exercises?: unknown
  blocks?: unknown
  durationSec?: unknown
}

/**
 * Apply a manual structure edit as the workout owner (athlete).
 * Callers must authorize: owner session, or coach with access to this athlete.
 */
export async function applyManualPlannedWorkoutStructureEdit(options: {
  ownerUserId: string
  plannedWorkoutId: string
  body: ManualStructureEditBody
}) {
  const { ownerUserId, plannedWorkoutId, body } = options
  const {
    text,
    steps: providedSteps,
    exercises: providedExercises,
    blocks: providedBlocks,
    durationSec: providedDurationSec
  } = body

  if (
    typeof text !== 'string' &&
    !Array.isArray(providedSteps) &&
    !Array.isArray(providedExercises) &&
    !Array.isArray(providedBlocks)
  ) {
    throw createError({
      statusCode: 400,
      message: 'Structure text, steps array, exercises array, or blocks array is required'
    })
  }

  const workout = await prisma.plannedWorkout.findUnique({
    where: { id: plannedWorkoutId },
    include: {
      user: {
        select: { ftp: true }
      }
    }
  })

  if (!workout) {
    throw createError({ statusCode: 404, message: 'Planned workout not found' })
  }

  if (workout.userId !== ownerUserId) {
    throw createError({ statusCode: 403, message: 'Access denied' })
  }

  if (await hasActiveStructureGenerationRun(plannedWorkoutId)) {
    throw createError({
      statusCode: 409,
      message:
        'Structure generation is still running for this workout. Wait for it to finish or regenerate before editing.'
    })
  }

  const steps = Array.isArray(providedSteps)
    ? providedSteps
    : typeof text === 'string'
      ? WorkoutParser.parseIntervalsICU(text, { workoutType: workout.type || '' })
      : []
  const rawStrengthStructure =
    Array.isArray(providedExercises) || Array.isArray(providedBlocks)
      ? {
          ...((workout.structuredWorkout as any) || {}),
          ...(Array.isArray(providedBlocks) ? { blocks: providedBlocks } : {}),
          ...(Array.isArray(providedExercises) ? { exercises: providedExercises } : {})
        }
      : null

  const incomingStructure = rawStrengthStructure || { steps }
  const incomingLimitIssues = validateStructuredWorkoutLimits(incomingStructure)
  if (incomingLimitIssues.length > 0) {
    throw createError({
      statusCode: 400,
      message: incomingLimitIssues[0]!.message,
      data: { issues: incomingLimitIssues }
    })
  }

  let normalizedStrengthStructure: any = null
  if (rawStrengthStructure) {
    try {
      normalizedStrengthStructure = normalizeStructuredStrengthWorkout(rawStrengthStructure)
    } catch (error: any) {
      throw createError({
        statusCode: 400,
        message: error?.message || 'Invalid strength exercise payload'
      })
    }
  }

  const structuredWorkout = {
    ...((workout.structuredWorkout as any) || {}),
    ...(Array.isArray(providedSteps) || typeof text === 'string' ? { steps } : {}),
    ...(normalizedStrengthStructure || {})
  }
  const sportSettings = await sportSettingsRepository.getForActivityType(
    ownerUserId,
    workout.type || ''
  )
  const { targetPolicy, targetFormatPolicy } = resolveWorkoutTargeting(sportSettings)
  const refs = {
    ftp: Number(sportSettings?.ftp || (workout.user as any)?.ftp || 250),
    lthr: Number(sportSettings?.lthr || 0),
    maxHr: Number(sportSettings?.maxHr || 0),
    thresholdPace: Number(sportSettings?.thresholdPace || 0),
    hrZones: Array.isArray(sportSettings?.hrZones) ? sportSettings.hrZones : [],
    powerZones: Array.isArray(sportSettings?.powerZones) ? sportSettings.powerZones : [],
    paceZones: Array.isArray(sportSettings?.paceZones) ? sportSettings.paceZones : []
  }
  const normalized = normalizeStructuredWorkoutForPersistence(structuredWorkout, {
    refs,
    targetPolicy,
    targetFormatPolicy,
    workoutType: workout.type || ''
  })
  const canonical = adaptStructuredWorkout(normalized, {
    source: 'MANUAL_EDIT',
    forceReadapt: true,
    zoneProfileSnapshot: createZoneProfileSnapshot(sportSettings)
  })
  if (!canonical || canonical.diagnostics?.length) {
    throw createError({
      statusCode: 422,
      message: 'Structure has unresolved targets. Declare target units before saving.',
      data: { diagnostics: canonical?.diagnostics || [] }
    })
  }
  const normalizedLimitIssues = validateStructuredWorkoutLimits(canonical)
  if (normalizedLimitIssues.length > 0) {
    throw createError({
      statusCode: 400,
      message: normalizedLimitIssues[0]!.message,
      data: { issues: normalizedLimitIssues }
    })
  }

  const persisted = await writeCanonicalPlannedWorkoutStructure({
    plannedWorkoutId,
    source: 'MANUAL_EDIT',
    structure: canonical,
    zoneProfileSnapshot: canonical.zoneProfileSnapshot,
    syncStatus: workout.syncStatus,
    refs,
    fallbackOrder: targetPolicy.fallbackOrder as Array<'power' | 'heartRate' | 'pace' | 'rpe'>,
    preservePlannedDuration:
      Number.isFinite(Number(providedDurationSec)) && Number(providedDurationSec) > 0
        ? Math.round(Number(providedDurationSec))
        : workout.durationSec
  })
  const updatedWorkout = persisted.workout!

  const sync = await syncManualPlannedWorkoutStructureToIntervalsIfSynced({
    userId: ownerUserId,
    plannedWorkoutId,
    priorSyncStatus: workout.syncStatus,
    updatedWorkout,
    canonical,
    sportSettings,
    liveUserFtp: (workout.user as any)?.ftp
  })

  const workoutResult = sync.synced
    ? await prisma.plannedWorkout.findUnique({ where: { id: plannedWorkoutId } })
    : updatedWorkout

  return {
    success: true,
    workout: workoutResult,
    intervals_synced: sync.synced
  }
}
