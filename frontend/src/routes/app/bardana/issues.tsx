import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BardanaIssueList } from "@/features/bardana/components"

export function BardanaIssuesPage() {
  return (
    <DashboardLayout activeNavItemId="bardana">
      <BardanaIssueList />
    </DashboardLayout>
  )
}
