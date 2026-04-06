import { AlertTriangle, Thermometer } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TemperatureAlert } from "../../types/temperature"

interface AlertCardProps {
  alert: TemperatureAlert
  onAcknowledge?: () => void
}

export function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  const isCritical = alert.status === "CRITICAL"

  return (
    <Card
      className={cn(
        "border-l-4",
        isCritical ? "border-l-red-500" : "border-l-amber-500"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={cn(
                "size-5",
                isCritical ? "text-status-danger-foreground" : "text-status-warning-foreground"
              )}
            />
            <CardTitle className="text-base">
              Room {alert.room_number}
              {alert.room_name && (
                <span className="font-normal text-muted-foreground ml-2">
                  ({alert.room_name})
                </span>
              )}
            </CardTitle>
          </div>
          <Badge variant={isCritical ? "destructive" : "outline"}>
            {alert.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Thermometer className="size-4 text-muted-foreground" />
            <span className="text-sm">
              Current: {alert.latest_reading.low_temp}°C - {alert.latest_reading.high_temp}°C
            </span>
          </div>
          {alert.threshold && (
            <div className="text-sm text-muted-foreground">
              Target range: {alert.threshold.target_low}°C - {alert.threshold.target_high}°C
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Last reading: {new Date(alert.latest_reading.reading_datetime).toLocaleString()}
          </div>
          {onAcknowledge && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAcknowledge}
              className="mt-2"
            >
              Acknowledge
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
