import { JWT } from "next-auth/jwt"

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  is_active: boolean
  created_at: string
}

export interface AuthSession {
  user?: User
  accessToken?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  statusCode?: number
}

export interface StatsOverview {
  total_users: number
  active_users: number
  admin_count: number
  new_this_month: number
}

declare module "next-auth" {
  interface Session {
    user?: User
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    user?: User
  }
}
