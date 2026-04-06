import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { ComponentBalances } from "../../types/account"
import { formatIndianNumber } from "../../utils/format-currency"

interface ComponentBreakdownProps {
  balances: ComponentBalances
  className?: string
}

const componentColors = {
  rent: "bg-status-info-muted text-status-info-foreground",
  loan: "bg-status-success-muted text-status-success-foreground",
  bardana: "bg-status-warning-muted text-status-warning-foreground",
  interest: "bg-status-danger-muted text-status-danger-foreground",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
}

const componentLabels = {
  rent: "Rent",
  loan: "Loan",
  bardana: "Bardana",
  interest: "Interest",
  other: "Other",
}

export function ComponentBreakdown({
  balances,
  className,
}: ComponentBreakdownProps) {
  const components = Object.entries(balances ?? {}).filter(
    ([, value]) => value !== 0
  )

  if (components.length === 0) {
    return null
  }

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {components.map(([key, value]) => (
        <Badge
          key={key}
          variant="secondary"
          className={cn(
            "font-normal text-xs",
            componentColors[key as keyof typeof componentColors]
          )}
        >
          {componentLabels[key as keyof typeof componentLabels]}:{" "}
          <span className="font-mono ml-1">{formatIndianNumber(Math.abs(value))}</span>
        </Badge>
      ))}
    </div>
  )
}
