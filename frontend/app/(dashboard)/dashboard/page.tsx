import { GridTable } from "@/components/dashboard/GridTable"

export default function DashboardPage() {
  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">תקציב משפחתי 💰</h1>
        <p className="text-slate-500 mt-1 text-sm">סיכום כספי שנתי</p>
      </div>

      <GridTable gridKey="monthly_balances" title="יתרות חודשיות" />
      <GridTable gridKey="monthly_summary" title="סיכום חודשי" />
    </div>
  )
}
