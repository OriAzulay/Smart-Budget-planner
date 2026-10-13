"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { monthsApi } from "@/lib/api"
import { Month } from "@/types"
import { MonthLineItemTable } from "@/components/dashboard/MonthLineItemTable"

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", minimumFractionDigits: 0 }).format(amount)

export default function MonthPage() {
  const { id } = useParams<{ id: string }>()
  const [month, setMonth] = useState<Month | null>(null)
  const [loading, setLoading] = useState(true)
  const [notesDraft, setNotesDraft] = useState("")

  const load = async () => {
    const res = await monthsApi.get(id)
    setMonth(res.data)
    setNotesDraft(res.data.notes ?? "")
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleBalanceBlur = async (field: "starting_balance" | "ending_balance", raw: string) => {
    await monthsApi.update(id, { [field]: raw === "" ? 0 : Number(raw) })
    load()
  }

  const handleNotesBlur = async () => {
    await monthsApi.update(id, { notes: notesDraft })
  }

  if (loading || !month) {
    return <div dir="rtl" className="text-center py-20 text-muted-foreground">טוען...</div>
  }

  const incomeItems = month.line_items.filter((i) => i.category === "income")
  const fixedItems = month.line_items.filter((i) => i.category === "fixed_expense")
  const variableItems = month.line_items.filter((i) => i.category === "variable_expense")

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{month.name} 📅</h1>
        <p className="text-muted-foreground text-sm mt-1">פירוט הכנסות והוצאות חודשיות</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl p-5 bg-income/15 text-income">
          <p className="text-foreground/70 text-sm mb-1">הכנסה חודשית</p>
          <p className="text-2xl font-bold">{formatCurrency(month.total_income)}</p>
        </div>
        <div className="rounded-xl p-5 bg-expense/15 text-expense">
          <p className="text-foreground/70 text-sm mb-1">הוצאות חודשיות</p>
          <p className="text-2xl font-bold">{formatCurrency(month.total_expenses)}</p>
        </div>
        <div className="rounded-xl p-5 bg-warning/20 text-foreground">
          <p className="text-foreground/70 text-sm mb-1">הוצאות קבועות</p>
          <p className="text-2xl font-bold">{formatCurrency(month.total_fixed_expenses)}</p>
          <p className="text-foreground/70 text-xs mt-1">משתנות: {formatCurrency(month.total_variable_expenses)}</p>
        </div>
        <div
          className={`rounded-xl p-5 ${
            month.balance >= 0 ? "bg-primary text-primary-foreground" : "bg-expense text-white"
          }`}
        >
          <p className="opacity-80 text-sm mb-1">קיזוז</p>
          <p className="text-2xl font-bold">{formatCurrency(month.balance)}</p>
        </div>
      </div>

      {/* Checking account balances */}
      <div className="bg-surface rounded-2xl shadow-soft dark:border dark:border-border p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground/80 mb-1">עו"ש התחלתי (תחילת חודש)</label>
          <input
            type="number"
            defaultValue={month.starting_balance}
            onBlur={(e) => handleBalanceBlur("starting_balance", e.target.value)}
            className="w-full border border-input bg-surface rounded-lg p-2 text-sm text-foreground/80 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground/80 mb-1">עו"ש (סוף חודש)</label>
          <input
            type="number"
            defaultValue={month.ending_balance}
            onBlur={(e) => handleBalanceBlur("ending_balance", e.target.value)}
            className="w-full border border-input bg-surface rounded-lg p-2 text-sm text-foreground/80 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="bg-surface rounded-2xl shadow-soft dark:border dark:border-border p-5">
        <h2 className="font-bold text-foreground mb-2">הערות והנחיות</h2>
        <textarea
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="הוסף הערות לחודש זה..."
          className="w-full border border-input bg-surface rounded-lg p-3 text-sm text-foreground/80 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <MonthLineItemTable
        monthId={id}
        category="income"
        title="הכנסות חודשיות"
        items={incomeItems}
        onChange={load}
      />
      <MonthLineItemTable
        monthId={id}
        category="fixed_expense"
        title="הוצאות קבועות"
        items={fixedItems}
        onChange={load}
      />
      <MonthLineItemTable
        monthId={id}
        category="variable_expense"
        title="הוצאות משתנות"
        items={variableItems}
        onChange={load}
      />
    </div>
  )
}
