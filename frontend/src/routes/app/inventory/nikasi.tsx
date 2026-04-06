import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  TruckIcon,
  PackageIcon,
  IndianRupeeIcon,
} from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatCard } from "@/components/ui/stat-card"
import { RentListTable } from "@/features/inventory/components/rent"
import { useRents } from "@/features/inventory"

function formatNumber(num: number): string {
  return num.toLocaleString("en-IN")
}

function formatCurrency(num: number): string {
  return `Rs. ${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
}

export function NikasiPage() {
  const navigate = useNavigate()
  const { rents, loading } = useRents()

  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<"all" | "SEEDHI" | "KATAI">("all")

  const filteredRents = React.useMemo(() => {
    let result = rents

    if (search) {
      const lowerSearch = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.serial_no.toLowerCase().includes(lowerSearch) ||
          r.party_name.toLowerCase().includes(lowerSearch) ||
          r.amad_no.toLowerCase().includes(lowerSearch) ||
          r.commodity_name.toLowerCase().includes(lowerSearch)
      )
    }

    if (typeFilter !== "all") {
      result = result.filter((r) => r.nikasi_type === typeFilter)
    }

    return result
  }, [rents, search, typeFilter])

  const handleView = () => {
    // Could open a detail view
  }

  // Calculate summary
  const totalAmount = rents.reduce((sum, r) => sum + r.total_amount, 0)
  const totalPackets = rents.reduce((sum, r) => sum + r.packets, 0)

  return (
    <DashboardLayout activeNavItemId="nikasi" breadcrumbs={[{ label: "Inventory", to: "/app/inventory/nikasi" }, { label: "Nikasi (Dispatch)" }]}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold" data-testid="nikasi-title">Nikasi (Goods Dispatch)</h1>
            <p className="text-sm text-muted-foreground">
              Record and manage goods dispatched from cold storage
            </p>
          </div>
          <Button onClick={() => navigate({ to: "/app/inventory/nikasi/new" })} data-testid="nikasi-new-button">
            <PlusIcon className="mr-2 size-4" />
            New Dispatch
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div data-testid="nikasi-kpi-total-dispatches">
            <StatCard
              title="Total Dispatches"
              value={rents.length}
              formatter={formatNumber}
              icon={TruckIcon}
              loading={loading}
            />
          </div>
          <div data-testid="nikasi-kpi-total-packets">
            <StatCard
              title="Total Packets Dispatched"
              value={totalPackets}
              formatter={formatNumber}
              icon={PackageIcon}
              loading={loading}
            />
          </div>
          <div data-testid="nikasi-kpi-total-rent">
            <StatCard
              title="Total Rent Collected"
              value={totalAmount}
              formatter={formatCurrency}
              icon={IndianRupeeIcon}
              loading={loading}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-base font-medium">
                Dispatch Entries
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search dispatches..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                    data-testid="nikasi-search-input"
                  />
                </div>
                <Select
                  value={typeFilter}
                  onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
                >
                  <SelectTrigger className="w-32" data-testid="nikasi-filter-select">
                    <FilterIcon className="size-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="SEEDHI">Seedhi</SelectItem>
                    <SelectItem value="KATAI">Katai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RentListTable
              rents={filteredRents}
              loading={loading}
              onView={handleView}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
