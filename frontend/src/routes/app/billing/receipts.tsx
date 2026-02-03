import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReceiptList } from "@/features/billing"

export function ReceiptsPage() {
  return (
    <DashboardLayout activeNavItemId="billing">
      <ReceiptList />
    </DashboardLayout>
  )
}
