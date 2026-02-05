import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PartyOutstandingList } from "@/features/bardana/components"

export function BardanaOutstandingPage() {
  return (
    <DashboardLayout activeNavItemId="bardana">
      <PartyOutstandingList />
    </DashboardLayout>
  )
}
