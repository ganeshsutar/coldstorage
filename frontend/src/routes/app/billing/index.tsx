import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RentBillList } from "@/features/billing"

export function BillingPage() {
  return (
    <DashboardLayout activeNavItemId="billing" breadcrumbs={[{ label: "Billing", to: "/app/billing" }, { label: "Rent Bills" }]}>
      <RentBillList />
    </DashboardLayout>
  )
}
