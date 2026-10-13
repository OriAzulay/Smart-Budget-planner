"use client"

import { UsersTable } from "@/components/dashboard/UsersTable"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
        <p className="text-foreground/80 mt-1">Manage all platform users.</p>
      </div>

      <UsersTable />
    </div>
  )
}
