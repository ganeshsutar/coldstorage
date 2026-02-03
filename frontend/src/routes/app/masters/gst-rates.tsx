import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GstRateList } from "@/features/masters"

export function GstRatesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <GstRateList />
      </div>
    </DashboardLayout>
  )
}
