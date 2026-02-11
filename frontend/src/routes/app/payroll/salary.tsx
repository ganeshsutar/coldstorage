import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SalaryProcessing } from "@/features/payroll"

export function SalaryProcessingPage() {
  return (
    <DashboardLayout activeNavItemId="payroll" breadcrumbs={[{ label: "Payroll", to: "/app/payroll" }, { label: "Salary Processing" }]}>
      <SalaryProcessing />
    </DashboardLayout>
  )
}
