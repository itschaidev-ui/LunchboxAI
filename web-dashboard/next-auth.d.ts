// next-auth.d.ts
import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    refreshToken?: string
    user: {
      discordId?: string
      username?: string
      discriminator?: string
      avatar?: string
      xp?: number
      level?: number
      streak?: number
    } & DefaultSession['user']
  }

  interface JWT {
    accessToken?: string
    refreshToken?: string
    discordId?: string
    username?: string
    discriminator?: string
    avatar?: string
  }
}
