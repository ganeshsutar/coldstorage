import { useParams } from "@tanstack/react-router"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { EmployeeDetailView } from "@/features/payroll"

export function EmployeeDetailPage() {
  const { id } = useParams({ strict: false })

  return (
    <DashboardLayout activeNavItemId="payroll">
      <EmployeeDetailView employeeId={id as string} />
    </DashboardLayout>
  )
}
