import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { EmployeeForm } from "@/features/payroll"

export function NewEmployeePage() {
  return (
    <DashboardLayout activeNavItemId="payroll">
      <EmployeeForm />
    </DashboardLayout>
  )
}
