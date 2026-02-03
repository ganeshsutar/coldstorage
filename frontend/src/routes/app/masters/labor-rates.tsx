import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LaborRateGrid } from "@/features/masters"

export function LaborRatesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <LaborRateGrid />
      </div>
    </DashboardLayout>
  )
}
