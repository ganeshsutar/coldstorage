import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AdvanceForm } from "@/features/loans"

export function NewAdvancePage() {
  return (
    <DashboardLayout activeNavItemId="loans" breadcrumbs={[{ label: "Loans", to: "/app/loans" }, { label: "New Advance" }]}>
      <AdvanceForm />
    </DashboardLayout>
  )
}
