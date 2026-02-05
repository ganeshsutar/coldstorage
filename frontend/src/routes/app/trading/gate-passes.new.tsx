import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GatePassForm } from "@/features/trading"

export function NewGatePassPage() {
  return (
    <DashboardLayout activeNavItemId="trading">
      <GatePassForm />
    </DashboardLayout>
  )
}
