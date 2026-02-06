import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PayrollDashboard } from "@/features/payroll"

export function PayrollPage() {
  return (
    <DashboardLayout activeNavItemId="payroll">
      <PayrollDashboard />
    </DashboardLayout>
  )
}
