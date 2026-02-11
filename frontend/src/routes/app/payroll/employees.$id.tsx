import { useParams } from "@tanstack/react-router"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { EmployeeDetailView } from "@/features/payroll"

export function EmployeeDetailPage() {
  const { id } = useParams({ strict: false })

  return (
    <DashboardLayout activeNavItemId="payroll" breadcrumbs={[{ label: "Payroll", to: "/app/payroll" }, { label: "Employee Details" }]}>
      <EmployeeDetailView employeeId={id as string} />
    </DashboardLayout>
  )
}
