import { useParams } from "@tanstack/react-router"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BardanaIssueDetail } from "@/features/bardana/components"

export function BardanaIssueDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string }

  return (
    <DashboardLayout activeNavItemId="bardana">
      <BardanaIssueDetail issueId={id} />
    </DashboardLayout>
  )
}
