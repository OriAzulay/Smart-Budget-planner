import { BudgetTabBar } from "@/components/dashboard/BudgetTabBar"

export default function BudgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-6">
      <BudgetTabBar />
      <div className="flex-1">{children}</div>
    </div>
  )
}
