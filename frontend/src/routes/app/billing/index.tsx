import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RentBillList } from "@/features/billing"

export function BillingPage() {
  return (
    <DashboardLayout activeNavItemId="billing">
      <RentBillList />
    </DashboardLayout>
  )
}
