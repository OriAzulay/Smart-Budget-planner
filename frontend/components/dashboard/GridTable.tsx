"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InlineAddPopover } from "@/components/dashboard/InlineAddPopover"
import { gridsApi } from "@/lib/api"
import { Grid } from "@/types"
import { Save, X } from "lucide-react"

interface GridTableProps {
  gridKey: string
  title: string
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", minimumFractionDigits: 0 }).format(amount)

type PendingCell = { row_id: string; column_id: string; value: number | null }

export function GridTable({ gridKey, title }: GridTableProps) {
  const [grid, setGrid] = useState<Grid | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<Record<string, PendingCell>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const res = await gridsApi.get(gridKey)
    setGrid(res.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridKey])

  const cellValue = (row: Grid["rows"][number], columnId: string) =>
    row.cells.find((c) => c.column_id === columnId)?.value ?? null

  // Only updates local state — nothing is written to the DB until "שמירה" is clicked.
  const handleCellChange = (rowId: string, columnId: string, raw: string) => {
    const value = raw === "" ? null : Number(raw)
    if (!grid) return
    setGrid({
      ...grid,
      rows: grid.rows.map((r) =>
        r.id !== rowId
          ? r
          : {
              ...r,
              cells: r.cells.some((c) => c.column_id === columnId)
                ? r.cells.map((c) => (c.column_id === columnId ? { ...c, value } : c))
                : [...r.cells, { id: `tmp-${columnId}`, row_id: rowId, column_id: columnId, value }],
            }
      ),
    })
    setPending((prev) => ({ ...prev, [`${rowId}:${columnId}`]: { row_id: rowId, column_id: columnId, value } }))
  }

  const handleSave = async () => {
    const changes = Object.values(pending)
    if (changes.length === 0) return
    setSaving(true)
    try {
      await Promise.all(changes.map((c) => gridsApi.upsertCell(gridKey, c)))
      setPending({})
    } finally {
      setSaving(false)
    }
  }

  const handleAddColumn = async (label: string) => {
    await gridsApi.addColumn(gridKey, label)
    await load()
  }

  const handleAddRow = async (label: string) => {
    await gridsApi.addRow(gridKey, label)
    await load()
  }

  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm("למחוק את העמודה? הפעולה בלתי הפיכה.")) return
    await gridsApi.deleteColumn(gridKey, columnId)
    await load()
  }

  const handleDeleteRow = async (rowId: string) => {
    if (!confirm("למחוק את השורה? הפעולה בלתי הפיכה.")) return
    await gridsApi.deleteRow(gridKey, rowId)
    await load()
  }

  const columnTotal = (columnId: string) =>
    grid ? grid.rows.reduce((s, r) => s + (cellValue(r, columnId) ?? 0), 0) : 0

  const rowTotal = (row: Grid["rows"][number]) =>
    grid ? grid.columns.reduce((s, c) => s + (cellValue(row, c.id) ?? 0), 0) : 0

  const grandTotal = grid ? grid.columns.reduce((s, c) => s + columnTotal(c.id), 0) : 0

  if (loading || !grid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-400 text-sm">טוען...</CardContent>
      </Card>
    )
  }

  return (
    <Card dir="rtl" className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3 bg-slate-50 border-b">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <InlineAddPopover
            triggerLabel="הוסף עמודה"
            inputPlaceholder="שם עמודה"
            onSubmit={handleAddColumn}
          />
          <InlineAddPopover
            triggerLabel="הוסף שורה"
            inputPlaceholder="שם שורה"
            onSubmit={handleAddRow}
          />
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
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right sticky right-0 bg-slate-100 min-w-[110px] z-10">
                &nbsp;
              </TableHead>
              {grid.columns.map((col) => (
                <TableHead key={col.id} className="text-center min-w-[100px] group">
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <button
                      onClick={() => handleDeleteColumn(col.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity"
                      title="מחק עמודה"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                </TableHead>
              ))}
              <TableHead className="text-center min-w-[100px] font-bold">סה"כ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grid.rows.map((row) => (
              <TableRow key={row.id} className="group">
                <TableCell className="font-semibold text-slate-700 sticky right-0 bg-inherit">
                  <span className="inline-flex items-center gap-1">
                    {row.label}
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity"
                      title="מחק שורה"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                </TableCell>
                {grid.columns.map((col) => {
                  const isDirty = Boolean(pending[`${row.id}:${col.id}`])
                  return (
                    <TableCell key={col.id} className="text-center p-1">
                      <input
                        type="number"
                        defaultValue={cellValue(row, col.id) ?? ""}
                        onBlur={(e) => handleCellChange(row.id, col.id, e.target.value)}
                        placeholder="—"
                        className={`w-20 text-center border rounded px-1 py-1 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-transparent ${
                          isDirty ? "border-amber-400 bg-amber-50" : "border-slate-200"
                        }`}
                      />
                    </TableCell>
                  )
                })}
                <TableCell className="text-center font-bold text-blue-700">
                  {formatCurrency(rowTotal(row))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 text-white text-sm font-bold">
          <span>סה"כ כולל</span>
          <span className="text-yellow-300">{formatCurrency(grandTotal)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
