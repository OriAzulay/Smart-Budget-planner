"use client"

import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    label: "דשבורד",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "ניהול משתמשים",
    href: "/users",
    icon: Users,
    adminOnly: true,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="hidden md:flex w-64 h-screen sticky top-0 bg-sidebar text-sidebar-foreground border-l border-sidebar-border flex-col">
      <div className="p-6 border-b border-sidebar-border text-right">
        <h1 className="text-xl font-bold">💰 תקציב משפחתי</h1>
        <p className="text-muted-foreground text-xs mt-1">ניהול תקציב חכם</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          if (item.adminOnly && session?.user?.role !== "admin") {
            return null
          }

          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors flex-row-reverse justify-end",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-sidebar-hover"
              )}
            >
              <span>{item.label}</span>
              <Icon className="w-5 h-5" />
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-sidebar-hover rounded-lg transition-colors flex-row-reverse justify-end"
        >
          <span>התנתקות</span>
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  )
}
