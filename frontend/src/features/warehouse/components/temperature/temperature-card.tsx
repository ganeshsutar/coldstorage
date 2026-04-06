import * as React from "react"
import {
  Thermometer,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LatestTemperature, TemperatureStatus } from "../../types/temperature"
import type { TemperatureTrend } from "../../utils/temperature-utils"

interface TemperatureCardProps {
  temperature: LatestTemperature
  trend?: TemperatureTrend
  onClick?: () => void
}

const statusConfig: Record<TemperatureStatus, {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  label: string
}> = {
  NORMAL: {
    icon: CheckCircle,
    color: "text-status-success-foreground",
    bgColor: "bg-status-success-muted",
    label: "Normal",
  },
  WARNING: {
    icon: AlertTriangle,
    color: "text-status-warning-foreground",
    bgColor: "bg-status-warning-muted",
    label: "Warning",
  },
  CRITICAL: {
    icon: AlertTriangle,
    color: "text-status-danger-foreground",
    bgColor: "bg-status-danger-muted",
    label: "Critical",
  },
  OFFLINE: {
    icon: XCircle,
    color: "text-gray-600 dark:text-gray-500",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    label: "Offline",
  },
}

const trendConfig: Record<
  TemperatureTrend,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  rising: {
    icon: TrendingUp,
    color: "text-status-danger-foreground",
    label: "Rising",
  },
  falling: {
    icon: TrendingDown,
    color: "text-status-info-foreground",
    label: "Falling",
  },
  stable: {
    icon: Minus,
    color: "text-status-success-foreground",
    label: "Stable",
  },
  unknown: {
    icon: Minus,
    color: "text-muted-foreground",
    label: "",
  },
}

export function TemperatureCard({ temperature, trend, onClick }: TemperatureCardProps) {
  const config = statusConfig[temperature.status]
  const StatusIcon = config.icon
  const trendInfo = trend ? trendConfig[trend] : null
  const TrendIcon = trendInfo?.icon

  const formatTemp = (temp: number | null) => {
    if (temp === null) return "--"
    return `${temp}°C`
  }

  const lastUpdated = temperature.reading_datetime
    ? new Date(temperature.reading_datetime).toLocaleString()
    : "Never"

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        config.bgColor
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Room {temperature.room_number}
            {temperature.room_name && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({temperature.room_name})
              </span>
            )}
          </CardTitle>
          <Badge
            variant={temperature.status === "NORMAL" ? "secondary" : "destructive"}
            className={cn(config.color)}
          >
            <StatusIcon className="size-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Thermometer className={cn("size-8", config.color)} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold font-mono">
                {formatTemp(temperature.low_temp)} - {formatTemp(temperature.high_temp)}
              </p>
              {TrendIcon && trendInfo && trend !== "unknown" && (
                <div className={cn("flex items-center gap-1", trendInfo.color)}>
                  <TrendIcon className="size-4" />
                  <span className="text-xs">{trendInfo.label}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
