import { useParams } from "@tanstack/react-router"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LoanDetailView } from "@/features/loans"

export function LoanDetailPage() {
  const { id } = useParams({ strict: false })

  return (
    <DashboardLayout activeNavItemId="loans" breadcrumbs={[{ label: "Loans", to: "/app/loans" }, { label: "Loan Details" }]}>
      <LoanDetailView loanId={id || ""} />
    </DashboardLayout>
  )
}
