import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DealForm } from "@/features/trading"

export function NewDealPage() {
  return (
    <DashboardLayout activeNavItemId="trading">
      <DealForm />
    </DashboardLayout>
  )
}
