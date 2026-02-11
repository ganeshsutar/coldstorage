import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AmadForm } from "@/features/inventory/components/amad"
import {
  useCommodities,
  useRooms,
  useVillages,
  amadService,
  type CreateAmadRequest,
} from "@/features/inventory"

export function NewAmadPage() {
  const navigate = useNavigate()
  const { commodities } = useCommodities(true) // Only active
  const { rooms } = useRooms(true)
  const { villages } = useVillages(true)

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (data: CreateAmadRequest) => {
    setLoading(true)
    setError(null)

    try {
      const amad = await amadService.createAmad(data)
      navigate({ to: `/app/inventory/amad/${amad.id}` })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create amad")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate({ to: "/app/inventory/amad" })
  }

  return (
    <DashboardLayout activeNavItemId="amad" breadcrumbs={[{ label: "Inventory", to: "/app/inventory/amad" }, { label: "New Amad" }]}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/app/inventory/amad" })}
            data-testid="new-amad-back-button"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold" data-testid="new-amad-title">New Amad Entry</h1>
            <p className="text-sm text-muted-foreground">
              Record new goods arrival at cold storage
            </p>
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md" data-testid="new-amad-error">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Amad Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AmadForm
              commodities={commodities}
              rooms={rooms}
              villages={villages}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
