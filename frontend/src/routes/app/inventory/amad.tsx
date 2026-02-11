import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { PlusIcon, SearchIcon, FilterIcon } from "lucide-react"

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
import {
  KPICards,
  AmadListTable,
} from "@/features/inventory/components/amad"
import {
  useAmads,
  useStockSummary,
  useTodaySummary,
  type AmadSummary,
} from "@/features/inventory"

export function AmadPage() {
  const navigate = useNavigate()
  const { amads, loading: amadsLoading } = useAmads()
  const { summary, loading: summaryLoading } = useStockSummary()
  const { summary: todaySummary } = useTodaySummary()

  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState<"all" | "active" | "completed">("all")

  const filteredAmads = React.useMemo(() => {
    let result = amads

    if (search) {
      const lowerSearch = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.amad_no.toLowerCase().includes(lowerSearch) ||
          a.party_name.toLowerCase().includes(lowerSearch) ||
          a.commodity_name.toLowerCase().includes(lowerSearch)
      )
    }

    if (filter === "active") {
      result = result.filter((a) => !a.is_fully_dispatched)
    } else if (filter === "completed") {
      result = result.filter((a) => a.is_fully_dispatched)
    }

    return result
  }, [amads, search, filter])

  const handleView = (amad: AmadSummary) => {
    navigate({ to: `/app/inventory/amad/${amad.id}` })
  }

  const handleDispatch = (amad: AmadSummary) => {
    navigate({ to: "/app/inventory/nikasi/new", search: { amad_id: amad.id } })
  }

  return (
    <DashboardLayout activeNavItemId="amad" breadcrumbs={[{ label: "Inventory", to: "/app/inventory/amad" }, { label: "Amad (Receipts)" }]}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Amad (Goods Arrival)</h1>
            <p className="text-sm text-muted-foreground">
              Record and manage incoming goods at cold storage
            </p>
          </div>
          <Button onClick={() => navigate({ to: "/app/inventory/amad/new" })}>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Amad
          </Button>
        </div>

        <KPICards
          summary={summary}
          todaySummary={todaySummary}
          loading={summaryLoading}
        />

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-base font-medium">
                Amad Entries
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search amads..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <Select
                  value={filter}
                  onValueChange={(v) => setFilter(v as typeof filter)}
                >
                  <SelectTrigger className="w-36">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AmadListTable
              amads={filteredAmads}
              loading={amadsLoading}
              onView={handleView}
              onDispatch={handleDispatch}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
