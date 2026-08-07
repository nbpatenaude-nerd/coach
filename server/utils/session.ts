import type { H3Event } from 'h3'
import { getCookie, getHeader } from 'h3'
import { getToken } from 'next-auth/jwt'
import { prisma } from './db'
import { coachingRepository } from './repositories/coachingRepository'

export interface CustomSession {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    timezone?: string | null
    language?: string | null
    uiLanguage?: string | null
    deactivatedAt?: string | Date | null
    id: string
    isAdmin: boolean
    isImpersonating?: boolean
    isCoaching?: boolean
    originalUserId?: string
    originalUserEmail?: string | null
  }
  expires: string
}

/**
 * Centralized session utility that handles regular authentication
 * and admin impersonation.
 *
 * Uses getToken() to read the JWT directly from cookies — no outbound HTTP
 * fetch, no auth.baseURL dependency, no recursion risk in production.
 */
export async function getServerSession(event: H3Event): Promise<CustomSession | null> {
  // Read the JWT directly from the request cookie — no HTTP round-trip,
  // no dependency on auth.baseURL, no recursion possible.
  const token = await getToken({
    req: event.node.req as any,
    secret: process.env.AUTH_SECRET || ''
  })

  if (!token || !token.sub) {
    return null
  }

  // Map JWT token fields to our session shape
  const baseUserId = (token.id as string) || token.sub

  // Verify the user still exists and is not deactivated
  const baseUser = await prisma.user.findUnique({
    where: { id: baseUserId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      timezone: true,
      language: true,
      uiLanguage: true,
      deactivatedAt: true,
      isAdmin: true
    }
  })

  if (!baseUser || baseUser.deactivatedAt) {
    return null
  }

  const baseSession: CustomSession = {
    user: {
      id: baseUser.id,
      name: baseUser.name,
      email: baseUser.email,
      image: baseUser.image,
      timezone: baseUser.timezone ?? null,
      language: baseUser.language ?? null,
      uiLanguage: baseUser.uiLanguage ?? null,
      deactivatedAt: baseUser.deactivatedAt ?? null,
      isAdmin: baseUser.isAdmin ?? false
    },
    expires: token.exp
      ? new Date(token.exp * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }

  // 2. Handle Admin Impersonation
  const impersonatedUserId = getCookie(event, 'auth.impersonated_user_id')

  if (baseUser.isAdmin && impersonatedUserId) {
    const targetUser = await prisma.user.findUnique({
      where: { id: impersonatedUserId }
    })

    if (targetUser) {
      return {
        ...baseSession,
        user: {
          ...baseSession.user!,
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          image: targetUser.image,
          timezone: targetUser.timezone ?? null,
          language: targetUser.language ?? null,
          uiLanguage: targetUser.uiLanguage ?? null,
          deactivatedAt: targetUser.deactivatedAt ?? null,
          isAdmin: (targetUser as any).isAdmin || false,
          isImpersonating: true,
          originalUserId: baseUser.id,
          originalUserEmail: baseUser.email
        }
      }
    }
  }

  // 3. Handle Coaching "Act As"
  const actAsUserId =
    getHeader(event, 'x-act-as-user') || getCookie(event, 'coach_wattz_act_as_user')

  if (actAsUserId && actAsUserId !== baseUser.id) {
    const hasRelationship = await coachingRepository.checkRelationship(baseUser.id, actAsUserId)

    if (hasRelationship) {
      const targetUser = await prisma.user.findUnique({
        where: { id: actAsUserId }
      })

      if (targetUser) {
        return {
          ...baseSession,
          user: {
            ...baseSession.user!,
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            image: targetUser.image,
            timezone: targetUser.timezone ?? null,
            language: targetUser.language ?? null,
            uiLanguage: targetUser.uiLanguage ?? null,
            deactivatedAt: targetUser.deactivatedAt ?? null,
            isAdmin: (targetUser as any).isAdmin || false,
            isCoaching: true,
            originalUserId: baseUser.id,
            originalUserEmail: baseUser.email
          }
        }
      }
    }
  }

  return baseSession
}
