"use client"

import { useSession, signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/theme/ThemeToggle"

export function Topbar() {
  const { data: session } = useSession()

  return (
    <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="text-muted-foreground text-right">
        <p className="text-sm">ברוך הבא,</p>
        <p className="font-semibold text-foreground">
          {session?.user?.name || "משתמש"}
        </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
          {session?.user?.name?.charAt(0) || "U"}
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm text-muted-foreground hover:bg-accent rounded-lg transition-colors"
        >
          התנתקות
        </button>
      </div>
    </header>
  )
}
