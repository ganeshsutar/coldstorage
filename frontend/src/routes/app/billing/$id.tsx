import { useParams } from "@tanstack/react-router"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BillDetailView } from "@/features/billing"

export function BillDetailPage() {
  const { id } = useParams({ strict: false })

  return (
    <DashboardLayout activeNavItemId="billing" breadcrumbs={[{ label: "Billing", to: "/app/billing" }, { label: "Bill Details" }]}>
      <BillDetailView billId={id || ""} />
    </DashboardLayout>
  )
}
