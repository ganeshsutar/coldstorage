import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeftIcon, CheckCircleIcon } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StockTransferWizard } from "@/features/inventory/components/transfer"
import { useAmads, type Amad } from "@/features/inventory"

export function StockTransferPage() {
  const navigate = useNavigate()
  const { amads, refetch } = useAmads({ is_fully_dispatched: false })
  const [completedAmad, setCompletedAmad] = React.useState<Amad | null>(null)

  const handleSuccess = (newAmad: Amad) => {
    setCompletedAmad(newAmad)
    refetch()
  }

  const handleCancel = () => {
    navigate({ to: "/app/inventory/amad" })
  }

  const handleNewTransfer = () => {
    setCompletedAmad(null)
  }

  return (
    <DashboardLayout activeNavItemId="stock-transfer" breadcrumbs={[{ label: "Inventory", to: "/app/inventory/amad" }, { label: "Stock Transfer" }]}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Go back"
            onClick={() => navigate({ to: "/app/inventory/amad" })}
            data-testid="transfer-back-button"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold" data-testid="transfer-title">Stock Transfer</h1>
            <p className="text-sm text-muted-foreground">
              Transfer stock between parties without rent charge
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {completedAmad ? "Transfer Completed" : "Transfer Stock"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedAmad ? (
              <div className="text-center py-8 space-y-4" data-testid="transfer-success">
                <div className="flex justify-center">
                  <CheckCircleIcon className="size-16 text-status-success-foreground" />
                </div>
                <h3 className="text-lg font-semibold">
                  Stock Transferred Successfully
                </h3>
                <p className="text-muted-foreground">
                  A new Amad entry has been created for the destination party.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 max-w-sm mx-auto text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New Amad No:</span>
                    <span className="font-mono">{completedAmad.amad_no}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Packets:</span>
                    <span>{completedAmad.total_packets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight:</span>
                    <span>{completedAmad.total_weight.toLocaleString("en-IN")} kg</span>
                  </div>
                </div>
                <div className="flex justify-center gap-4 pt-4">
                  <Button variant="outline" onClick={handleNewTransfer} data-testid="transfer-new-button">
                    New Transfer
                  </Button>
                  <Button onClick={() => navigate({ to: `/app/inventory/amad/${completedAmad.id}` })} data-testid="transfer-view-amad-button">
                    View New Amad
                  </Button>
                </div>
              </div>
            ) : (
              <StockTransferWizard
                amads={amads}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
