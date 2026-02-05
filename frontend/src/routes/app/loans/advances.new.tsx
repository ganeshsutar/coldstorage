import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AdvanceForm } from "@/features/loans"

export function NewAdvancePage() {
  return (
    <DashboardLayout activeNavItemId="loans">
      <AdvanceForm />
    </DashboardLayout>
  )
}
