import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockSummary } from "@/features/bardana/components"

export function BardanaStockPage() {
  return (
    <DashboardLayout activeNavItemId="bardana">
      <StockSummary />
    </DashboardLayout>
  )
}
