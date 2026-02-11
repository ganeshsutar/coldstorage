import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BillWizard } from "@/features/billing"

export function NewBillPage() {
  return (
    <DashboardLayout activeNavItemId="billing" breadcrumbs={[{ label: "Billing", to: "/app/billing" }, { label: "New Rent Bill" }]}>
      <BillWizard />
    </DashboardLayout>
  )
}
