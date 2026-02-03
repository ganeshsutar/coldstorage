import * as React from "react"
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
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/50">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-green-700 dark:text-green-300">
                All Systems Normal
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                No temperature alerts at this time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
      <CardContent className="py-6">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/50">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-700 dark:text-amber-300">
              {alerts.length} Active Alert{alerts.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-4 text-sm mt-1">
              {criticalCount > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  {criticalCount} Critical
                </span>
              )}
              {warningCount > 0 && (
                <span className="text-amber-600 dark:text-amber-400">
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
