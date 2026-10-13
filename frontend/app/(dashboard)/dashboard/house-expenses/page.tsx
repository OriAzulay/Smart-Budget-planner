import { GridTable } from "@/components/dashboard/GridTable"

export default function HouseExpensesPage() {
  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">הוצאות בית 🏠</h1>
        <p className="text-muted-foreground mt-1 text-sm">תשלומים שנתיים לפי קטגוריה</p>
      </div>

      <GridTable gridKey="fixed_expenses" title="הוצאות קבועות" totalsMode="column" />
    </div>
  )
}
