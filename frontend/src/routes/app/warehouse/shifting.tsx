import { useNavigate } from "@tanstack/react-router"
import { Plus, RefreshCw } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useShiftHeaders } from "@/features/warehouse"
import { ShiftingListTable } from "@/features/warehouse/components/shifting"

export function ShiftingPage() {
  const navigate = useNavigate()
  const { headers, loading, refetch } = useShiftHeaders()

  return (
    <DashboardLayout activeNavItemId="shifting" breadcrumbs={[{ label: "Chambers", to: "/app/warehouse" }, { label: "Shifting" }]}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Goods Shifting</h1>
            <p className="text-muted-foreground">
              Move goods between racks and rooms
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="size-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => navigate({ to: "/app/warehouse/shifting/new" })}>
              <Plus className="size-4 mr-2" />
              New Shift
            </Button>
          </div>
        </div>

        {/* Shifting List */}
        <Card>
          <CardHeader>
            <CardTitle>Shift Records</CardTitle>
          </CardHeader>
          <CardContent>
            <ShiftingListTable headers={headers} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
