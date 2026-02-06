import { useParams } from "@tanstack/react-router"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PaySlip } from "@/features/payroll"

export function PaySlipPage() {
  const { id } = useParams({ strict: false })

  return (
    <DashboardLayout activeNavItemId="payroll">
      <PaySlip attendanceId={id as string} />
    </DashboardLayout>
  )
}
