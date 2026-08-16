"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { monthsApi } from "@/lib/api"
import { MonthSummary } from "@/types"
import { InlineAddPopover } from "@/components/dashboard/InlineAddPopover"

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
]

const staticTabs = [
  { label: "ראשי", href: "/dashboard" },
  { label: "הוצאות קבועות", href: "/dashboard/house-expenses" },
]

export function BudgetTabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [months, setMonths] = useState<MonthSummary[]>([])

  const loadMonths = async () => {
    const res = await monthsApi.list()
    setMonths(res.data)
  }

  useEffect(() => {
    loadMonths()
  }, [])

  const tabClass = (isActive: boolean) =>
    cn(
      "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
      isActive ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
    )

  return (
    <div dir="rtl" className="flex items-center gap-2 px-6 py-3 bg-white border-b border-slate-200 overflow-x-auto">
      {staticTabs.map((tab) => (
        <Link key={tab.href} href={tab.href} className={tabClass(pathname === tab.href)}>
          {tab.label}
        </Link>
      ))}

      <div className="w-px self-stretch bg-slate-200 mx-1" />

      {months.map((month) => (
        <Link
          key={month.id}
          href={`/dashboard/month/${month.id}`}
          className={tabClass(pathname === `/dashboard/month/${month.id}`)}
        >
          {month.name}
        </Link>
      ))}

      <InlineAddPopover triggerLabel="הוסף חודש" onSubmit={async () => {}}>
        {({ close }) => (
          <AddMonthForm
            onCreated={async (id) => {
              close()
              await loadMonths()
              router.push(`/dashboard/month/${id}`)
            }}
          />
        )}
      </InlineAddPopover>
    </div>
  )
}

function AddMonthForm({ onCreated }: { onCreated: (id: string) => void }) {
  const [month, setMonth] = useState(HEBREW_MONTHS[0])
  const [year, setYear] = useState(new Date().getFullYear())
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await monthsApi.create(`${month} ${year}`)
      onCreated(res.data.id)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <select
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
      >
        {HEBREW_MONTHS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded px-2 py-1.5 transition-colors"
      >
        הוסף חודש
      </button>
    </form>
  )
}
