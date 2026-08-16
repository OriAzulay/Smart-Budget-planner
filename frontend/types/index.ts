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

export interface GridColumn {
  id: string
  label: string
  order_index: number
}

export interface GridCell {
  id: string
  row_id: string
  column_id: string
  value: number | null
}

export interface GridRow {
  id: string
  label: string
  order_index: number
  cells: GridCell[]
}

export interface Grid {
  id: string
  key: string
  title: string
  created_at: string
  columns: GridColumn[]
  rows: GridRow[]
}

export type LineItemCategory = "income" | "fixed_expense" | "variable_expense"

export interface MonthLineItem {
  id: string
  category: LineItemCategory
  source: string
  amount: number
  notes: string | null
  order_index: number
}

export interface MonthSummary {
  id: string
  name: string
  order_index: number
}

export interface Month {
  id: string
  name: string
  order_index: number
  starting_balance: number
  ending_balance: number
  notes: string | null
  line_items: MonthLineItem[]
  total_income: number
  total_fixed_expenses: number
  total_variable_expenses: number
  total_expenses: number
  balance: number
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
