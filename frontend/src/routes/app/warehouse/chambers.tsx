import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ChambersTab } from "@/features/warehouse/components/chambers"

export function ChambersPage() {
  return (
    <DashboardLayout activeNavItemId="chamber-management" breadcrumbs={[{ label: "Chambers", to: "/app/warehouse" }, { label: "Chamber Management" }]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Chamber Management</h1>
          <p className="text-muted-foreground">
            Manage cold storage chambers and their floor configurations
          </p>
        </div>

        {/* Content */}
        <ChambersTab />
      </div>
    </DashboardLayout>
  )
}
