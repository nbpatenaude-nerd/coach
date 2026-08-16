import { NuxtAuthHandler } from '#auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../../utils/db'
import bcrypt from 'bcrypt'

export default NuxtAuthHandler({
  adapter: PrismaAdapter(prisma as any),
  secret: process.env.NUXT_AUTH_SECRET || process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        ;(session.user as any).id = token.id

        // Fetch fresh user data needed for global middleware checks
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            termsAcceptedAt: true,
            deactivatedAt: true,
            isAdmin: true,
            isCoach: true,
            role: true
          }
        })

        if (dbUser) {
          ;(session.user as any).termsAcceptedAt = dbUser.termsAcceptedAt
          ;(session.user as any).deactivatedAt = dbUser.deactivatedAt
          ;(session.user as any).isAdmin = dbUser.isAdmin
          ;(session.user as any).isCoach = dbUser.isCoach
          ;(session.user as any).role = dbUser.role
        }
      }
      return session
    }
  },
  providers: [
    // @ts-expect-error: NextAuth provider default export mismatch
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true
    }),
    // @ts-expect-error: NextAuth provider default export mismatch
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.hashedPassword) return null

        const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword)
        if (!isPasswordValid) return null

        return user
      }
    })
  ]
})
