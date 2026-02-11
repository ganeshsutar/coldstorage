import { useParams } from "@tanstack/react-router"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AdvanceDetailView } from "@/features/loans"

export function AdvanceDetailPage() {
  const { id } = useParams({ strict: false })

  return (
    <DashboardLayout activeNavItemId="loans" breadcrumbs={[{ label: "Loans", to: "/app/loans" }, { label: "Advance Details" }]}>
      <AdvanceDetailView advanceId={id || ""} />
    </DashboardLayout>
  )
}
