import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LoanForm } from "@/features/loans"

export function NewLoanPage() {
  return (
    <DashboardLayout activeNavItemId="loans">
      <LoanForm />
    </DashboardLayout>
  )
}
