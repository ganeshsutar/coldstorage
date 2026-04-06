import * as React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface TrendProps {
  value: number
  direction: "up" | "down" | "neutral"
}

interface StatCardProps {
  title: string
  value: string | number
  formatter?: (value: number) => string
  trend?: TrendProps
  icon?: React.ComponentType<{ className?: string }>
  description?: string
  subValue?: string
  secondaryDescription?: string
  descriptionIcon?: React.ComponentType<{ className?: string }>
  loading?: boolean
  onClick?: () => void
  className?: string
  valueClassName?: string
}

function TrendBadge({ trend }: { trend: TrendProps }) {
  const isPositive = trend.direction === "up"
  const isNegative = trend.direction === "down"

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-sm font-medium",
        isPositive && "text-status-success-foreground",
        isNegative && "text-status-danger-foreground",
        !isPositive && !isNegative && "text-muted-foreground"
      )}
    >
      {isPositive && <TrendingUp className="h-4 w-4" />}
      {isNegative && <TrendingDown className="h-4 w-4" />}
      <span>
        {trend.value > 0 ? "+" : ""}
        {trend.value}%
      </span>
    </div>
  )
}

function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("bg-gradient-to-br from-muted to-card py-0 gap-0", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <Skeleton className="h-7 w-20 mt-2" />
        <Skeleton className="h-3 w-16 mt-1" />
      </CardContent>
    </Card>
  )
}

function StatCard({
  title,
  value,
  formatter,
  trend,
  icon: Icon,
  description,
  subValue,
  secondaryDescription,
  descriptionIcon: DescIcon,
  loading,
  onClick,
  className,
  valueClassName,
}: StatCardProps) {
  if (loading) {
    return <StatCardSkeleton className={className} />
  }

  const displayValue =
    typeof value === "number" && formatter ? formatter(value) : value

  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-muted to-card py-0 gap-0",
        onClick && "cursor-pointer hover:bg-accent/50 transition-colors",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {trend && <TrendBadge trend={trend} />}
          {Icon && !trend && (
            <div className="p-2 rounded-md bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <p className={cn("text-2xl font-bold mt-1", valueClassName)}>
          {displayValue}
        </p>
        {(description || subValue || secondaryDescription) && (
          <div className="mt-1 space-y-0.5">
            {subValue && description ? (
              <p className="text-xs text-muted-foreground">
                {subValue} {description}
              </p>
            ) : description ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {description}
                {DescIcon && <DescIcon className="h-3 w-3" />}
              </p>
            ) : null}
            {secondaryDescription && (
              <p className="text-xs text-muted-foreground">
                {secondaryDescription}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { StatCard, StatCardSkeleton }
export type { StatCardProps, TrendProps }
