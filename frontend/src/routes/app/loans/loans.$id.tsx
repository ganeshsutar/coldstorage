import { useParams } from "@tanstack/react-router"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LoanDetailView } from "@/features/loans"

export function LoanDetailPage() {
  const { id } = useParams({ strict: false })

  return (
    <DashboardLayout activeNavItemId="loans">
      <LoanDetailView loanId={id || ""} />
    </DashboardLayout>
  )
}
