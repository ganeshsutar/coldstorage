import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LoanForm } from "@/features/loans"

export function NewLoanPage() {
  return (
    <DashboardLayout activeNavItemId="loans" breadcrumbs={[{ label: "Loans", to: "/app/loans" }, { label: "New Loan" }]}>
      <LoanForm />
    </DashboardLayout>
  )
}
