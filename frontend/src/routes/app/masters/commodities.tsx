import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CommodityList } from "@/features/masters"

export function CommoditiesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <CommodityList />
      </div>
    </DashboardLayout>
  )
}
