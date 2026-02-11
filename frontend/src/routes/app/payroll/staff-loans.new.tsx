import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StaffLoanForm } from "@/features/payroll"

export function NewStaffLoanPage() {
  return (
    <DashboardLayout activeNavItemId="payroll" breadcrumbs={[{ label: "Payroll", to: "/app/payroll" }, { label: "New Staff Loan" }]}>
      <StaffLoanForm />
    </DashboardLayout>
  )
}
