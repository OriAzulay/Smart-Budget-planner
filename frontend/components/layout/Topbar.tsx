"use client"

import { useSession, signOut } from "next-auth/react"

export function Topbar() {
  const { data: session } = useSession()

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="text-slate-600 text-right">
        <p className="text-sm">ברוך הבא,</p>
        <p className="font-semibold text-slate-900">
          {session?.user?.name || "משתמש"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
          {session?.user?.name?.charAt(0) || "U"}
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          התנתקות
        </button>
      </div>
    </header>
  )
}
