import { randomUUID } from 'node:crypto'
import type { Event, TeamEvent, TeamEventParticipant, User } from '@prisma/client'
import { prisma } from './db'
import {
  COMMUNITY_EVENT_SOURCE,
  eventDayKey,
  scoreCommunityMatch,
  type CommunityEventListItem,
  type CommunityEventMatchCandidate,
  type CommunityEventMatchInput,
  type TeamEventShareLevel
} from '../../shared/community-events'

export {
  COMMUNITY_EVENT_SOURCE,
  COMMUNITY_TITLE_MATCH_THRESHOLD,
  communityEventFingerprint,
  eventDayKey,
  eventsLookAlike,
  normalizeEventTitle,
  scoreCommunityMatch,
  titleSimilarity
} from '../../shared/community-events'
export type {
  CommunityEventListItem,
  CommunityEventMatchCandidate,
  CommunityEventMatchInput,
  TeamEventShareLevel
} from '../../shared/community-events'

type TeamEventWithRelations = TeamEvent & {
  createdBy: Pick<User, 'id' | 'name'>
  participants: Array<
    TeamEventParticipant & {
      user: Pick<User, 'id' | 'name' | 'image'>
    }
  >
}

function teamEventFieldsFromEvent(event: Event) {
  return {
    title: event.title,
    description: event.description,
    date: event.date,
    startTime: event.startTime,
    type: event.type,
    subType: event.subType,
    distance: event.distance,
    elevation: event.elevation,
    expectedDuration: event.expectedDuration,
    terrain: event.terrain,
    city: event.city,
    country: event.country,
    location: event.location,
    isVirtual: event.isVirtual,
    websiteUrl: event.websiteUrl
  }
}

function copyableFieldsFromTeamEvent(team: TeamEvent) {
  return {
    title: team.title,
    description: team.description,
    date: team.date,
    startTime: team.startTime,
    type: team.type,
    subType: team.subType,
    distance: team.distance,
    elevation: team.elevation,
    expectedDuration: team.expectedDuration,
    terrain: team.terrain,
    city: team.city,
    country: team.country,
    location: team.location,
    isVirtual: team.isVirtual,
    websiteUrl: team.websiteUrl
  }
}

async function ensureTeamParticipant(
  teamEventId: string,
  userId: string,
  priority?: string | null
) {
  await prisma.teamEventParticipant.upsert({
    where: { teamEventId_userId: { teamEventId, userId } },
    update: {},
    create: {
      id: randomUUID(),
      teamEventId,
      userId,
      priority: priority ?? 'B'
    }
  })
}

export async function findMatchingTeamEvents(
  input: CommunityEventMatchInput,
  options: { excludeTeamEventId?: string; limit?: number } = {}
): Promise<Array<TeamEvent & { score: number; attendeeCount: number }>> {
  const day = eventDayKey(input.date)
  const dayStart = new Date(`${day}T00:00:00.000Z`)
  const dayEnd = new Date(`${day}T23:59:59.999Z`)

  const candidates = await prisma.teamEvent.findMany({
    where: {
      date: { gte: dayStart, lte: dayEnd },
      ...(options.excludeTeamEventId ? { id: { not: options.excludeTeamEventId } } : {})
    },
    include: {
      _count: { select: { participants: true } }
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'asc' }]
  })

  const scored = candidates
    .map((c) => {
      const score = scoreCommunityMatch(input, c)
      if (score === null) return null
      return {
        ...c,
        score,
        attendeeCount: c._count.participants
      }
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => b.score - a.score || b.attendeeCount - a.attendeeCount)

  return scored.slice(0, options.limit ?? 5)
}

export async function previewCommunityMatches(
  input: CommunityEventMatchInput
): Promise<CommunityEventMatchCandidate[]> {
  const matches = await findMatchingTeamEvents(input)
  return matches.map((m) => ({
    id: m.id,
    title: m.title,
    date: m.date.toISOString(),
    city: m.city,
    location: m.location,
    attendeeCount: m.attendeeCount,
    score: Math.round(m.score * 100) / 100,
    isPinned: m.isPinned
  }))
}

export async function createTeamEventFromPersonal(
  userId: string,
  event: Event,
  options: {
    shareLevel?: TeamEventShareLevel
    hideAttendeeNames?: boolean
  } = {}
): Promise<TeamEvent> {
  const team = await prisma.teamEvent.create({
    data: {
      id: randomUUID(),
      ...teamEventFieldsFromEvent(event),
      shareLevel: options.shareLevel ?? 'FULL',
      hideAttendeeNames: options.hideAttendeeNames ?? false,
      createdById: userId
    }
  })

  await prisma.event.update({
    where: { id: event.id },
    data: {
      teamEventId: team.id,
      isPublic: true,
      source: event.source ?? COMMUNITY_EVENT_SOURCE,
      externalId: event.externalId ?? team.id
    }
  })

  await ensureTeamParticipant(team.id, userId, event.priority)
  return team
}

/**
 * Ensure personal Event is linked to TeamEvent (clone if needed) + participant row.
 */
export async function ensurePersonalTeamEventCopy(
  userId: string,
  team: TeamEvent,
  options: { priority?: string | null } = {}
): Promise<{ event: Event; created: boolean }> {
  const existingLinked = await prisma.event.findFirst({
    where: {
      userId,
      OR: [{ teamEventId: team.id }, { source: COMMUNITY_EVENT_SOURCE, externalId: team.id }]
    }
  })

  if (existingLinked) {
    await prisma.event.update({
      where: { id: existingLinked.id },
      data: { teamEventId: team.id }
    })
    await ensureTeamParticipant(team.id, userId, options.priority ?? existingLinked.priority)
    return { event: existingLinked, created: false }
  }

  // Creator may already own a public event that was backfilled with teamEventId = event.id
  const owned = await prisma.event.findFirst({
    where: { userId, teamEventId: team.id }
  })
  if (owned) {
    await ensureTeamParticipant(team.id, userId, options.priority ?? owned.priority)
    return { event: owned, created: false }
  }

  const created = await prisma.event.create({
    data: {
      ...copyableFieldsFromTeamEvent(team),
      userId,
      source: COMMUNITY_EVENT_SOURCE,
      externalId: team.id,
      teamEventId: team.id,
      isPublic: false,
      priority: options.priority ?? 'B',
      syncStatus: 'LOCAL_ONLY'
    }
  })

  await ensureTeamParticipant(team.id, userId, options.priority ?? created.priority)
  return { event: created, created: true }
}

export async function joinTeamEvent(
  userId: string,
  teamEventId: string,
  options: { priority?: string | null } = {}
) {
  const team = await prisma.teamEvent.findUnique({ where: { id: teamEventId } })
  if (!team) {
    throw createError({ statusCode: 404, message: 'Team event not found' })
  }

  const { event, created } = await ensurePersonalTeamEventCopy(userId, team, options)
  return {
    success: true as const,
    attending: true as const,
    created,
    event: {
      id: event.id,
      title: event.title,
      date: event.date.toISOString()
    },
    teamEventId: team.id
  }
}

export async function leaveTeamEvent(userId: string, teamEventId: string) {
  const team = await prisma.teamEvent.findUnique({ where: { id: teamEventId } })
  if (!team) {
    throw createError({ statusCode: 404, message: 'Team event not found' })
  }

  await prisma.teamEventParticipant.deleteMany({
    where: { teamEventId, userId }
  })

  // Keep the creator's original event; remove community clones for others.
  if (team.createdById !== userId) {
    await prisma.event.deleteMany({
      where: {
        userId,
        OR: [
          { teamEventId, source: COMMUNITY_EVENT_SOURCE },
          { source: COMMUNITY_EVENT_SOURCE, externalId: teamEventId }
        ]
      }
    })
    await prisma.event.updateMany({
      where: { userId, teamEventId, isPublic: false },
      data: { teamEventId: null }
    })
  }

  return { success: true as const, attending: false as const }
}

export type AfterCreateCommunityOptions = {
  /** Explicitly join this TeamEvent (from confirm UI). */
  joinTeamEventId?: string | null
  /** User chose "create separately" — do not auto-join matches. */
  skipCommunityDedupe?: boolean
  shareLevel?: TeamEventShareLevel
  hideAttendeeNames?: boolean
}

export type AfterUpdateCommunityOptions = {
  shareLevel?: TeamEventShareLevel
  hideAttendeeNames?: boolean
}

/**
 * Post-update Team Calendar hook.
 * Checking "Share on Team Calendar" on edit must create/link a TeamEvent —
 * the calendar lists TeamEvent rows, not Event.isPublic alone.
 */
export async function afterPersonalEventUpdated(
  userId: string,
  event: Event,
  options: AfterUpdateCommunityOptions = {}
): Promise<{
  event: Event
  teamEventId: string | null
}> {
  if (event.isPublic) {
    if (event.teamEventId) {
      await prisma.teamEvent.update({
        where: { id: event.teamEventId },
        data: {
          ...teamEventFieldsFromEvent(event),
          ...(options.shareLevel ? { shareLevel: options.shareLevel } : {}),
          ...(typeof options.hideAttendeeNames === 'boolean'
            ? { hideAttendeeNames: options.hideAttendeeNames }
            : {})
        }
      })
      await ensureTeamParticipant(event.teamEventId, userId, event.priority)
      const refreshed = await prisma.event.findUniqueOrThrow({ where: { id: event.id } })
      return { event: refreshed, teamEventId: event.teamEventId }
    }

    const team = await createTeamEventFromPersonal(userId, event, {
      shareLevel: options.shareLevel,
      hideAttendeeNames: options.hideAttendeeNames
    })
    const refreshed = await prisma.event.findUniqueOrThrow({ where: { id: event.id } })
    return { event: refreshed, teamEventId: team.id }
  }

  // Unchecking share leaves an existing TeamEvent (teammates may already attend).
  // Still sync field updates when linked so the calendar stays accurate.
  if (event.teamEventId) {
    await prisma.teamEvent.update({
      where: { id: event.teamEventId },
      data: teamEventFieldsFromEvent(event)
    })
  }

  return { event, teamEventId: event.teamEventId }
}

/**
 * Post-create Team Calendar hook. Never silent-joins without joinTeamEventId —
 * the client must confirm matches first.
 */
export async function afterPersonalEventCreated(
  userId: string,
  event: Event,
  options: AfterCreateCommunityOptions = {}
): Promise<{
  event: Event
  teamEventId: string | null
  linkedRootId: string | null
  deduped: boolean
}> {
  if (options.joinTeamEventId) {
    const join = await joinTeamEvent(userId, options.joinTeamEventId, {
      priority: event.priority
    })
    if (join.event.id !== event.id) {
      const goals = await prisma.goal.findMany({
        where: { events: { some: { id: event.id } } },
        select: { id: true }
      })
      if (goals.length) {
        await prisma.event.update({
          where: { id: join.event.id },
          data: { goals: { connect: goals.map((g) => ({ id: g.id })) } }
        })
      }
      await prisma.event.delete({ where: { id: event.id } }).catch(() => undefined)
    } else {
      await prisma.event.update({
        where: { id: event.id },
        data: { teamEventId: options.joinTeamEventId, isPublic: false }
      })
    }

    const personal = await prisma.event.findUniqueOrThrow({ where: { id: join.event.id } })
    return {
      event: personal,
      teamEventId: options.joinTeamEventId,
      linkedRootId: options.joinTeamEventId,
      deduped: true
    }
  }

  if (event.isPublic) {
    const team = await createTeamEventFromPersonal(userId, event, {
      shareLevel: options.shareLevel,
      hideAttendeeNames: options.hideAttendeeNames
    })
    const refreshed = await prisma.event.findUniqueOrThrow({ where: { id: event.id } })
    return {
      event: refreshed,
      teamEventId: team.id,
      linkedRootId: team.id,
      deduped: false
    }
  }

  // Private create without explicit join — leave standalone (confirm UI handles matches).
  return {
    event,
    teamEventId: null,
    linkedRootId: null,
    deduped: false
  }
}

/** @deprecated Prefer joinTeamEvent — kept for attend route id param = teamEventId */
export async function joinCommunityEvent(
  userId: string,
  teamEventId: string,
  options: { priority?: string | null } = {}
) {
  return joinTeamEvent(userId, teamEventId, options)
}

/** @deprecated Prefer leaveTeamEvent */
export async function removeCommunityAttendance(userId: string, teamEventId: string) {
  return leaveTeamEvent(userId, teamEventId)
}

export async function setTeamEventPinned(
  actor: { id: string; isCoach?: boolean | null; isAdmin?: boolean | null; role?: string | null },
  teamEventId: string,
  pinned: boolean
) {
  const isAdmin = actor.isAdmin || actor.role === 'ADMIN'
  if (!actor.isCoach && !isAdmin) {
    throw createError({ statusCode: 403, message: 'Only coaches can pin team events' })
  }

  const team = await prisma.teamEvent.findUnique({ where: { id: teamEventId } })
  if (!team) {
    throw createError({ statusCode: 404, message: 'Team event not found' })
  }

  return prisma.teamEvent.update({
    where: { id: teamEventId },
    data: pinned
      ? { isPinned: true, pinnedAt: new Date(), pinnedById: actor.id }
      : { isPinned: false, pinnedAt: null, pinnedById: null }
  })
}

function toListItem(
  team: TeamEventWithRelations,
  userId: string,
  myEventId: string | null
): CommunityEventListItem {
  const isAttending = team.participants.some((p) => p.userId === userId)
  const isOwner = team.createdById === userId
  const summaryOnly = team.shareLevel === 'SUMMARY'

  const attendees = team.hideAttendeeNames
    ? []
    : team.participants.slice(0, 8).map((p) => ({
        userId: p.user.id,
        name: p.user.name,
        image: p.user.image
      }))

  return {
    id: team.id,
    title: team.title,
    description: summaryOnly ? null : team.description,
    date: team.date.toISOString(),
    startTime: summaryOnly ? null : team.startTime,
    type: summaryOnly ? null : team.type,
    subType: summaryOnly ? null : team.subType,
    distance: summaryOnly ? null : team.distance,
    elevation: summaryOnly ? null : team.elevation,
    location: summaryOnly ? null : team.location,
    city: team.city,
    country: summaryOnly ? null : team.country,
    isVirtual: team.isVirtual,
    websiteUrl: summaryOnly ? null : team.websiteUrl,
    shareLevel: team.shareLevel,
    hideAttendeeNames: team.hideAttendeeNames,
    isPinned: team.isPinned,
    attendeeCount: team.participants.length,
    attendees,
    isAttending,
    isOnMyCalendar: Boolean(myEventId) || isAttending || isOwner,
    myEventId: myEventId ?? (isOwner ? team.id : null),
    createdBy: { id: team.createdBy.id, name: team.createdBy.name }
  }
}

export async function listCommunityEventsForUser(
  userId: string
): Promise<CommunityEventListItem[]> {
  const since = new Date(Date.now() - 7 * 86400000)

  const [teams, myLinks] = await Promise.all([
    prisma.teamEvent.findMany({
      where: { date: { gte: since } },
      orderBy: [{ isPinned: 'desc' }, { date: 'asc' }, { title: 'asc' }],
      include: {
        createdBy: { select: { id: true, name: true } },
        participants: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    }),
    prisma.event.findMany({
      where: {
        userId,
        OR: [{ teamEventId: { not: null } }, { source: COMMUNITY_EVENT_SOURCE }]
      },
      select: { id: true, teamEventId: true, externalId: true, source: true }
    })
  ])

  const myByTeam = new Map<string, string>()
  for (const row of myLinks) {
    if (row.teamEventId) myByTeam.set(row.teamEventId, row.id)
    else if (row.source === COMMUNITY_EVENT_SOURCE && row.externalId) {
      myByTeam.set(row.externalId, row.id)
    }
  }

  return teams.map((team) =>
    toListItem(team as TeamEventWithRelations, userId, myByTeam.get(team.id) ?? null)
  )
}
