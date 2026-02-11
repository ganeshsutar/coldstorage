import { useParams } from "@tanstack/react-router"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReceiptDetailView } from "@/features/billing"

export function ReceiptDetailPage() {
  const { id } = useParams({ strict: false })

  return (
    <DashboardLayout activeNavItemId="billing" breadcrumbs={[{ label: "Billing", to: "/app/billing" }, { label: "Receipt Details" }]}>
      <ReceiptDetailView receiptId={id || ""} />
    </DashboardLayout>
  )
}
