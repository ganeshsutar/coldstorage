import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RentForm } from "@/features/inventory/components/rent"
import {
  useAmads,
  rentService,
  type CreateRentRequest,
  type RentCalculation,
} from "@/features/inventory"

export function NewNikasiPage() {
  const navigate = useNavigate()
  const { amads } = useAmads({ is_fully_dispatched: false })

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleCalculate = async (
    amadId: string,
    date: string,
    packets: number,
    weight: number
  ): Promise<RentCalculation | null> => {
    try {
      return await rentService.calculateRent({
        amad_id: amadId,
        dispatch_date: date,
        packets,
        weight,
      })
    } catch {
      return null
    }
  }

  const handleSubmit = async (data: CreateRentRequest) => {
    setLoading(true)
    setError(null)

    try {
      await rentService.createWithLedger(data)
      navigate({ to: "/app/inventory/nikasi" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create dispatch")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate({ to: "/app/inventory/nikasi" })
  }

  return (
    <DashboardLayout activeNavItemId="nikasi">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/app/inventory/nikasi" })}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">New Dispatch Entry</h1>
            <p className="text-sm text-muted-foreground">
              Record goods dispatch with rent calculation
            </p>
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Dispatch Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RentForm
              amads={amads}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              onCalculate={handleCalculate}
              loading={loading}
              selectedPartyId={undefined}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
