import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { VillageList } from "@/features/masters"

export function VillagesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <VillageList />
      </div>
    </DashboardLayout>
  )
}
