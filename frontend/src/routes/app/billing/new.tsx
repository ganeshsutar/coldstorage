import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BillWizard } from "@/features/billing"

export function NewBillPage() {
  return (
    <DashboardLayout activeNavItemId="billing">
      <BillWizard />
    </DashboardLayout>
  )
}
