import { useParams } from "@tanstack/react-router"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BillDetailView } from "@/features/billing"

export function BillDetailPage() {
  const { id } = useParams({ strict: false })

  return (
    <DashboardLayout activeNavItemId="billing">
      <BillDetailView billId={id || ""} />
    </DashboardLayout>
  )
}
