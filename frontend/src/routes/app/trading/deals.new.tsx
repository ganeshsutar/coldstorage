import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DealForm } from "@/features/trading"

export function NewDealPage() {
  return (
    <DashboardLayout activeNavItemId="trading" breadcrumbs={[{ label: "Trading", to: "/app/trading" }, { label: "New Deal" }]}>
      <DealForm />
    </DashboardLayout>
  )
}
