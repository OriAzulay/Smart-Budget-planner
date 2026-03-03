"use client"

import { useEffect, useState } from "react"
import { Users, TrendingUp, User, Lock } from "lucide-react"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { UsersAreaChart } from "@/components/dashboard/UsersAreaChart"
import { statsApi } from "@/lib/api"
import { StatsOverview } from "@/types"

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await statsApi.overview()
        setStats(response.data)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        // Set defaults on error
        setStats({
          total_users: 0,
          active_users: 0,
          admin_count: 0,
          new_this_month: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-slate-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          trend={12}
          trendLabel="vs last month"
        />
        <StatsCard
          title="Active Users"
          value={stats?.active_users || 0}
          icon={<User className="w-6 h-6 text-green-600" />}
          trend={8}
          trendLabel="increase"
        />
        <StatsCard
          title="Admins"
          value={stats?.admin_count || 0}
          icon={<Lock className="w-6 h-6 text-purple-600" />}
        />
        <StatsCard
          title="New This Month"
          value={stats?.new_this_month || 0}
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
        />
      </div>

      <UsersAreaChart />
    </div>
  )
}
