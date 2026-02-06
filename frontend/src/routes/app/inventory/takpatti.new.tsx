import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TakpattiForm } from "@/features/inventory/components/takpatti"
import {
  useAmads,
  useRooms,
  takpattiService,
  type CreateTakpattiRequest,
} from "@/features/inventory"

export function NewTakpattiPage() {
  const navigate = useNavigate()
  const { amads } = useAmads()
  const { rooms } = useRooms(true)

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (data: CreateTakpattiRequest) => {
    setLoading(true)
    setError(null)

    try {
      await takpattiService.createTakpatti(data)
      navigate({ to: "/app/inventory/takpatti" })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create takpatti"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate({ to: "/app/inventory/takpatti" })
  }

  return (
    <DashboardLayout activeNavItemId="takpatti">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/app/inventory/takpatti" })}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">New Takpatti</h1>
            <p className="text-sm text-muted-foreground">
              Create a new weighment slip
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
              Takpatti Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TakpattiForm
              amads={amads}
              rooms={rooms}
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
