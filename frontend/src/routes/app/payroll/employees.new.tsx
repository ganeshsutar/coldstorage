import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { EmployeeForm } from "@/features/payroll"

export function NewEmployeePage() {
  return (
    <DashboardLayout activeNavItemId="payroll" breadcrumbs={[{ label: "Payroll", to: "/app/payroll" }, { label: "New Employee" }]}>
      <EmployeeForm />
    </DashboardLayout>
  )
}
