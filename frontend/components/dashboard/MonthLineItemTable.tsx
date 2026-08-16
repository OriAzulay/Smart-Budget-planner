"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InlineAddPopover } from "@/components/dashboard/InlineAddPopover"
import { monthsApi } from "@/lib/api"
import { LineItemCategory, MonthLineItem } from "@/types"
import { Save, X } from "lucide-react"

interface MonthLineItemTableProps {
  monthId: string
  category: LineItemCategory
  title: string
  items: MonthLineItem[]
  onChange: () => void
}

type PendingItem = { amount?: number; notes?: string }

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", minimumFractionDigits: 0 }).format(amount)

export function MonthLineItemTable({ monthId, category, title, items, onChange }: MonthLineItemTableProps) {
  const [pending, setPending] = useState<Record<string, PendingItem>>({})
  const [saving, setSaving] = useState(false)

  const displayAmount = (item: MonthLineItem) => pending[item.id]?.amount ?? item.amount
  const total = items.reduce((s, i) => s + displayAmount(i), 0)

  // Only updates local state — nothing is written to the DB until "שמירה" is clicked.
  const handleAmountChange = (itemId: string, raw: string) => {
    const amount = raw === "" ? 0 : Number(raw)
    setPending((prev) => ({ ...prev, [itemId]: { ...prev[itemId], amount } }))
  }

  const handleNotesChange = (itemId: string, notes: string) => {
    setPending((prev) => ({ ...prev, [itemId]: { ...prev[itemId], notes } }))
  }

  const handleSave = async () => {
    const entries = Object.entries(pending)
    if (entries.length === 0) return
    setSaving(true)
    try {
      await Promise.all(entries.map(([itemId, changes]) => monthsApi.updateLineItem(monthId, itemId, changes)))
      setPending({})
      onChange()
    } finally {
      setSaving(false)
    }
  }

  const handleAddItem = async (source: string) => {
    await monthsApi.addLineItem(monthId, { category, source, amount: 0 })
    onChange()
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm("למחוק את השורה? הפעולה בלתי הפיכה.")) return
    await monthsApi.deleteLineItem(monthId, itemId)
    onChange()
  }

  return (
    <div dir="rtl" className="bg-white rounded-xl shadow overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-800">
        <h2 className="text-white font-bold text-lg">{title}</h2>
        <div className="flex items-center gap-2">
          <InlineAddPopover triggerLabel="הוסף" inputPlaceholder="מקור" onSubmit={handleAddItem} />
          <button
            type="button"
            onClick={handleSave}
            disabled={Object.keys(pending).length === 0 || saving}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "שומר..." : "שמירה"}
          </button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">מקור</TableHead>
            <TableHead className="text-center w-32">סכום</TableHead>
            <TableHead className="text-right">הערות</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isDirty = Boolean(pending[item.id])
            return (
              <TableRow key={item.id} className="group">
                <TableCell className="text-slate-700">{item.source}</TableCell>
                <TableCell className="text-center p-1">
                  <input
                    type="number"
                    defaultValue={item.amount}
                    onBlur={(e) => handleAmountChange(item.id, e.target.value)}
                    className={`w-24 text-center border rounded px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                      isDirty ? "border-amber-400 bg-amber-50" : "border-slate-200"
                    }`}
                  />
                </TableCell>
                <TableCell className="p-1">
                  <input
                    type="text"
                    defaultValue={item.notes ?? ""}
                    onBlur={(e) => handleNotesChange(item.id, e.target.value)}
                    className={`w-full border rounded px-2 py-1 text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                      isDirty ? "border-amber-400 bg-amber-50" : "border-slate-200"
                    }`}
                  />
                </TableCell>
                <TableCell className="p-1">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity"
                    title="מחק שורה"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 text-white text-sm font-bold">
        <span>סה"כ</span>
        <span className="text-yellow-300">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
