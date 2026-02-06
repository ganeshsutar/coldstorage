import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AttendanceGrid } from "@/features/payroll"

export function AttendancePage() {
  return (
    <DashboardLayout activeNavItemId="payroll">
      <AttendanceGrid />
    </DashboardLayout>
  )
}
