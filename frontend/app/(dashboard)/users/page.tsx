"use client"

import { UsersTable } from "@/components/dashboard/UsersTable"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Users Management</h1>
        <p className="text-slate-600 mt-1">Manage all platform users.</p>
      </div>

      <UsersTable />
    </div>
  )
}
