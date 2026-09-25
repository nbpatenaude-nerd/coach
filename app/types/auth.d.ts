import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      isCoach: boolean
      termsAcceptedAt: string | null
      timezone: string | null
      deactivatedAt: string | null
    } & DefaultSession['user']
  }

  interface User {
    isAdmin: boolean
    isCoach: boolean
    deactivatedAt: Date | null
  }
}
