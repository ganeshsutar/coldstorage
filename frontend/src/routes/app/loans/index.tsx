import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LoanDashboard } from "@/features/loans"

export function LoansPage() {
  return (
    <DashboardLayout activeNavItemId="loans" breadcrumbs={[{ label: "Loans", to: "/app/loans" }, { label: "Dashboard" }]}>
      <LoanDashboard />
    </DashboardLayout>
  )
}
