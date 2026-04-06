import { CheckCircle, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { TemperatureAlert } from "../../types/temperature"

interface AlertSummaryCardProps {
  alerts: TemperatureAlert[]
  loading?: boolean
}

export function AlertSummaryCard({ alerts, loading }: AlertSummaryCardProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="py-6">
          <div className="h-16 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  const criticalCount = alerts.filter((a) => a.status === "CRITICAL").length
  const warningCount = alerts.filter((a) => a.status === "WARNING").length
  const hasAlerts = alerts.length > 0

  if (!hasAlerts) {
    return (
      <Card className="border-status-success-muted bg-status-success-muted">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-status-success-muted p-3">
              <CheckCircle className="size-6 text-status-success-foreground" />
            </div>
            <div>
              <p className="font-semibold text-status-success-foreground">
                All Systems Normal
              </p>
              <p className="text-sm text-status-success-foreground">
                No temperature alerts at this time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-status-warning-muted bg-status-warning-muted">
      <CardContent className="py-6">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-status-warning-muted p-3">
            <AlertTriangle className="size-6 text-status-warning-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-status-warning-foreground">
              {alerts.length} Active Alert{alerts.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-4 text-sm mt-1">
              {criticalCount > 0 && (
                <span className="text-status-danger-foreground">
                  {criticalCount} Critical
                </span>
              )}
              {warningCount > 0 && (
                <span className="text-status-warning-foreground">
                  {warningCount} Warning
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
