import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReceiptList } from "@/features/billing"

export function ReceiptsPage() {
  return (
    <DashboardLayout activeNavItemId="billing" breadcrumbs={[{ label: "Billing", to: "/app/billing" }, { label: "Receipts" }]}>
      <ReceiptList />
    </DashboardLayout>
  )
}
