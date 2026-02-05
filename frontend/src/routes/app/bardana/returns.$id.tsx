import { useParams } from "@tanstack/react-router"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BardanaReturnDetail } from "@/features/bardana/components"

export function BardanaReturnDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string }

  return (
    <DashboardLayout activeNavItemId="bardana">
      <BardanaReturnDetail returnId={id} />
    </DashboardLayout>
  )
}
