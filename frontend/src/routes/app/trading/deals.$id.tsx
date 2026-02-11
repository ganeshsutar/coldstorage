import { useParams } from "@tanstack/react-router"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DealDetailView } from "@/features/trading"

export function DealDetailPage() {
  const { id } = useParams({ strict: false })

  return (
    <DashboardLayout activeNavItemId="trading" breadcrumbs={[{ label: "Trading", to: "/app/trading" }, { label: "Deal Details" }]}>
      <DealDetailView dealId={id || ""} />
    </DashboardLayout>
  )
}
