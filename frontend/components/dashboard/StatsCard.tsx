"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { ReactNode } from "react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: number
  trendLabel?: string
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
}: StatsCardProps) {
  const isPositive = trend && trend > 0

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        <div className="text-slate-400">{icon}</div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {trend !== undefined && (
          <p
            className={`text-xs flex items-center gap-1 ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(trend)}% {trendLabel || "change"}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
