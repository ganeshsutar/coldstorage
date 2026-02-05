import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DealList } from "@/features/trading"

export function TradingPage() {
  return (
    <DashboardLayout activeNavItemId="trading">
      <DealList />
    </DashboardLayout>
  )
}
