import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BardanaReturnList } from "@/features/bardana/components"

export function BardanaReturnsPage() {
  return (
    <DashboardLayout activeNavItemId="bardana">
      <BardanaReturnList />
    </DashboardLayout>
  )
}
