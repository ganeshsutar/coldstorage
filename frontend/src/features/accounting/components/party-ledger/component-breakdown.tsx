import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { ComponentBalances } from "../../types/account"
import { formatIndianNumber } from "../../utils/format-currency"

interface ComponentBreakdownProps {
  balances: ComponentBalances
  className?: string
}

const componentColors = {
  rent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  loan: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  bardana: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  interest: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
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
  const components = Object.entries(balances).filter(
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
