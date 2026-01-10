import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import AzureAD from 'next-auth/providers/azure-ad'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

export const authConfig: NextAuthConfig = {
    providers: [
        // Email/Password Login
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email ve şifre gerekli')
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if (!user || !user.password) {
                    throw new Error('Geçersiz email veya şifre')
                }

                const isPasswordValid = await compare(
                    credentials.password as string,
                    user.password
                )

                if (!isPasswordValid) {
                    throw new Error('Geçersiz email veya şifre')
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                }
            }
        }),

        // Google OAuth
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),

        // GitHub OAuth
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),

        // Microsoft/Azure AD OAuth
        AzureAD({
            clientId: process.env.MICROSOFT_CLIENT_ID!,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
            tenantId: 'common',
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    scope: "openid profile email User.Read",
                    prompt: "select_account",
                },
            },
        }),
    ],

    pages: {
        signIn: '/login',
        error: '/login',
    },

    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
            }

            if (trigger === 'update' && session) {
                token = { ...token, ...session.user }
            }

            return token
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session
        },

        async signIn({ user, account, profile }) {
            if (account?.provider !== 'credentials') {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! },
                        include: { accounts: true, subscription: true }
                    })

                    if (existingUser) {
                        // Account linking
                        const accountExists = existingUser.accounts.some(
                            acc => acc.provider === account.provider
                        )

                        if (!accountExists) {
                            await prisma.account.create({
                                data: {
                                    userId: existingUser.id,
                                    type: account.type,
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                    refresh_token: account.refresh_token,
                                    access_token: account.access_token,
                                    expires_at: account.expires_at,
                                    token_type: account.token_type,
                                    scope: account.scope,
                                    id_token: account.id_token,
                                    session_state: account.session_state as string | null,
                                }
                            })
                        }

                        // Image update
                        if (user.image && !existingUser.image) {
                            await prisma.user.update({
                                where: { id: existingUser.id },
                                data: { image: user.image }
                            })
                        }

                        // 🆕 SUBSCRIPTION OLUŞTUR (yoksa)
                        if (!existingUser.subscription) {
                            await prisma.subscription.create({
                                data: {
                                    userId: existingUser.id,
                                    planType: 'free',
                                    status: 'active',
                                    maxChatbots: 1,
                                    maxDocuments: 3,
                                    maxConversations: 50,
                                    conversationsUsed: 0,
                                    storageLimit: 100,
                                    storageUsed: 0,
                                    currentPeriodStart: new Date(),
                                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
                                }
                            })
                            console.log('✅ Free subscription created for:', existingUser.email)
                        }

                        return true
                    } else {
                        // Yeni kullanıcı - NextAuth otomatik user oluşturacak
                        // Subscription'ı sonraki giriş'te oluşturacağız
                        return true
                    }
                } catch (error) {
                    console.error('SignIn callback error:', error)
                    return false
                }
            }

            // 🆕 Credentials ile giriş - subscription kontrolü
            if (account?.provider === 'credentials') {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! },
                        include: { subscription: true }
                    })

                    if (existingUser && !existingUser.subscription) {
                        await prisma.subscription.create({
                            data: {
                                userId: existingUser.id,
                                planType: 'free',
                                status: 'active',
                                maxChatbots: 1,
                                maxDocuments: 3,
                                maxConversations: 50,
                                conversationsUsed: 0,
                                storageLimit: 100,
                                storageUsed: 0,
                                currentPeriodStart: new Date(),
                            }
                        })
                        console.log('✅ Free subscription created for:', existingUser.email)
                    }
                } catch (error) {
                    console.error('Subscription creation error:', error)
                }
            }

            return true
        },
    },

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },

    secret: process.env.NEXTAUTH_SECRET,
}