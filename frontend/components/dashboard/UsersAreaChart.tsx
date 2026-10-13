"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useTheme } from "@/components/theme/ThemeProvider"

// Recharts takes colors as props, so mirror the theme tokens here.
const chartColors = {
  light: { line: "#F4845F", grid: "#F3DCCB", axis: "#7A8B91", tooltipBg: "#1F4E5F", tooltipBorder: "#1F4E5F", tooltipText: "#FFF4EA" },
  dark: { line: "#7C5CFF", grid: "#252D5C", axis: "#8A90B8", tooltipBg: "#151B38", tooltipBorder: "#252D5C", tooltipText: "#E6E8F5" },
}

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
  const colors = chartColors[useTheme().theme]

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="text-foreground">New Users (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.line} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors.line} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="day" stroke={colors.axis} />
            <YAxis stroke={colors.axis} />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: "8px",
              }}
              labelStyle={{ color: colors.tooltipText }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke={colors.line}
              fillOpacity={1}
              fill="url(#colorUsers)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
