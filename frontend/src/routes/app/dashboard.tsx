import { Link } from "@tanstack/react-router"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  IndianRupee,
  Receipt,
  Warehouse,
  Handshake,
  Plus,
  RefreshCw,
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
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDashboard } from "@/features/inventory/hooks/use-amad"
import { formatCurrency, formatNumber, formatWeight } from "@/utils/formatters"
import { quickCreateItems } from "@/config/navigation"

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function DashboardPage() {
  const { data, loading, error, refetch } = useDashboard()

  return (
    <DashboardLayout activeNavItemId="dashboard" breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-6">
        {/* Header with refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your cold storage operations
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Error state */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <StatCard
            title="Today's Inward"
            value={data ? formatNumber(data.today_summary.arrivals.count) : "—"}
            icon={ArrowDownToLine}
            description={data ? `${formatNumber(data.today_summary.arrivals.packets)} packets` : undefined}
            loading={loading}
          />
          <StatCard
            title="Today's Outward"
            value={data ? formatNumber(data.today_summary.dispatches.count) : "—"}
            icon={ArrowUpFromLine}
            description={data ? `${formatNumber(data.today_summary.dispatches.packets)} packets` : undefined}
            loading={loading}
          />
          <StatCard
            title="Active Stock"
            value={data ? formatNumber(data.stock_summary.remaining_packets) : "—"}
            icon={Package}
            description={data ? formatWeight(data.stock_summary.remaining_weight, "qtl") : undefined}
            loading={loading}
          />
          <StatCard
            title="Pending Dues"
            value={data ? formatCurrency(parseFloat(data.pending_dues)) : "—"}
            icon={IndianRupee}
            loading={loading}
            valueClassName="text-xl"
          />
          <StatCard
            title="Today's Receipts"
            value={data ? formatCurrency(parseFloat(data.today_receipts)) : "—"}
            icon={Receipt}
            loading={loading}
            valueClassName="text-xl"
          />
          <StatCard
            title="Chamber Utilization"
            value={data ? `${data.avg_utilization}%` : "—"}
            icon={Warehouse}
            loading={loading}
          />
          <StatCard
            title="Active Saudas"
            value={data ? formatNumber(data.active_saudas) : "—"}
            icon={Handshake}
            loading={loading}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {/* Recent Amads table */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Amads</CardTitle>
              <CardDescription>Latest inward entries</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                  Loading...
                </div>
              ) : data && data.recent_amads.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amad No</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead>Commodity</TableHead>
                      <TableHead className="text-right">Packets</TableHead>
                      <TableHead className="text-right">Weight (qtl)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recent_amads.map((amad) => (
                      <TableRow key={amad.id}>
                        <TableCell className="text-muted-foreground">
                          {formatDate(amad.date)}
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link
                            to="/app/inventory/amad/$id"
                            params={{ id: String(amad.id) }}
                            className="text-primary hover:underline"
                          >
                            {amad.amad_no}
                          </Link>
                        </TableCell>
                        <TableCell>{amad.party_name}</TableCell>
                        <TableCell>{amad.commodity_name}</TableCell>
                        <TableCell className="text-right">
                          {formatNumber(amad.total_packets)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(parseFloat(amad.total_weight))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                  No recent amads
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickCreateItems.map((item) => (
                <Button
                  key={item.id}
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to={item.to}>
                    <Plus className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
