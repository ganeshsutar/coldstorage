import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BardanaTypeList } from "@/features/bardana/components"

export function BardanaTypesPage() {
  return (
    <DashboardLayout activeNavItemId="bardana">
      <BardanaTypeList />
    </DashboardLayout>
  )
}
