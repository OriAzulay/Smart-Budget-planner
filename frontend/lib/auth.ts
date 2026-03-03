import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authApi } from "./api"
import { User } from "@/types"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        try {
          const response = await authApi.login({
            email: credentials.email,
            password: credentials.password,
          })

          const { access_token } = response.data

          // Get user data
          const userResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          )

          if (!userResponse.ok) {
            throw new Error("Failed to fetch user")
          }

          const user: User = await userResponse.json()

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            created_at: user.created_at,
            accessToken: access_token,
          }
        } catch (error: any) {
          throw new Error(error?.response?.data?.detail || "Login failed")
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken
        token.user = user as User
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.user = token.user as User
      return session
    },
  },
  events: {
    async signIn({ user }) {
      console.log("User signed in:", user.email)
    },
  },
})
