"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data for the last 7 days
const mockData = [
  { day: "Mon", users: 24 },
  { day: "Tue", users: 32 },
  { day: "Wed", users: 28 },
  { day: "Thu", users: 41 },
  { day: "Fri", users: 38 },
  { day: "Sat", users: 45 },
  { day: "Sun", users: 52 },
]

export function UsersAreaChart() {
  return (
    <Card className="col-span-1 md:col-span-2 bg-white">
      <CardHeader>
        <CardTitle className="text-slate-900">New Users (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#f1f5f9" }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorUsers)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
