import {
  PackageIcon,
  WarehouseIcon,
  ThermometerIcon,
  BellIcon,
} from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"

export function DashboardPage() {
  return (
    <DashboardLayout activeNavItemId="dashboard" breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value="1,234"
          icon={PackageIcon}
          description="+20% from last month"
        />
        <StatCard
          title="Storage Units"
          value="24"
          icon={WarehouseIcon}
          description="+2 added this month"
        />
        <StatCard
          title="Avg. Temperature"
          value="-18°C"
          icon={ThermometerIcon}
          description="Optimal range maintained"
        />
        <StatCard
          title="Alerts"
          value="3"
          icon={BellIcon}
          description="2 resolved today"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Chart placeholder - Add recharts or similar library
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your storage facilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Temperature Alert
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Unit A3 temperature above threshold
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  2m ago
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Inventory Updated
                  </p>
                  <p className="text-sm text-muted-foreground">
                    500 units added to Unit B1
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  1h ago
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Maintenance Complete
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Unit C2 maintenance completed
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  3h ago
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
