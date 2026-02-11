import * as React from "react"
import { PlusIcon, SearchIcon } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TakpattiListTable, TakpattiDialog } from "@/features/inventory/components/takpatti"
import {
  useTakpattis,
  takpattiService,
  type Takpatti,
} from "@/features/inventory"

export function TakpattiPage() {
  const { takpattis, loading, refetch } = useTakpattis()

  const [search, setSearch] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const filteredTakpattis = React.useMemo(() => {
    if (!search) return takpattis

    const lowerSearch = search.toLowerCase()
    return takpattis.filter(
      (t) =>
        t.takpatti_no.toLowerCase().includes(lowerSearch) ||
        t.amad_no.toLowerCase().includes(lowerSearch) ||
        (t.party_name && t.party_name.toLowerCase().includes(lowerSearch))
    )
  }, [takpattis, search])

  const handleDelete = async (takpatti: Takpatti) => {
    try {
      await takpattiService.deleteTakpatti(takpatti.id)
      refetch()
    } catch {
      // Error handled silently — refetch will show current state
    }
  }

  return (
    <DashboardLayout activeNavItemId="takpatti" breadcrumbs={[{ label: "Inventory", to: "/app/inventory/takpatti" }, { label: "Takpatti" }]}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold" data-testid="takpatti-title">Takpatti</h1>
            <p className="text-sm text-muted-foreground">
              Weighment slips for inventory items
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} data-testid="takpatti-new-button">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Takpatti
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-base font-medium">
                Weighment Records
              </CardTitle>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search takpattis..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                  data-testid="takpatti-search-input"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TakpattiListTable
              takpattis={filteredTakpattis}
              loading={loading}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>

      <TakpattiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refetch}
      />
    </DashboardLayout>
  )
}
