import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GatePassForm } from "@/features/trading"

export function NewGatePassPage() {
  return (
    <DashboardLayout activeNavItemId="trading" breadcrumbs={[{ label: "Trading", to: "/app/trading" }, { label: "New Gate Pass" }]}>
      <GatePassForm />
    </DashboardLayout>
  )
}
