import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { Adapter } from 'next-auth/adapters';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    // LinkedIn provider configuration
    {
      id: 'linkedin',
      name: 'LinkedIn',
      type: 'oauth',
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      authorization: {
        url: 'https://www.linkedin.com/oauth/v2/authorization',
        params: {
          scope: 'openid profile email',
          response_type: 'code',
        },
      },
      token: 'https://www.linkedin.com/oauth/v2/accessToken',
      userinfo: {
        url: 'https://api.linkedin.com/v2/userinfo',
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user exists
      if (!user.email) {
        return false;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      // If user doesn't exist, create one
      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email,
            emailVerified: true, // OAuth users are pre-verified
            subscriptionTier: 'free',
            subscriptionStatus: 'active',
          },
        });
      } else if (!existingUser.emailVerified) {
        // If user exists but email not verified, verify it
        await prisma.user.update({
          where: { email: user.email },
          data: { emailVerified: true },
        });
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: {
            id: true,
            email: true,
            subscriptionTier: true,
          },
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.email = dbUser.email;
          token.subscriptionTier = dbUser.subscriptionTier;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.subscriptionTier = token.subscriptionTier as string;
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        isNewUser,
      });
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
