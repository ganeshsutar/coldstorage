import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BardanaReturnList } from "@/features/bardana/components"

export function BardanaReturnsPage() {
  return (
    <DashboardLayout activeNavItemId="bardana" breadcrumbs={[{ label: "Bardana", to: "/app/bardana/returns" }, { label: "Returns" }]}>
      <BardanaReturnList />
    </DashboardLayout>
  )
}
