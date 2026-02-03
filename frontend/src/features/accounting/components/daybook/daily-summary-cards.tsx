import { BanknoteIcon, BuildingIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DaybookSummary } from "../../types/daybook"
import { formatIndianNumber } from "../../utils/format-currency"

interface DailySummaryCardsProps {
  summary: DaybookSummary | null
  loading?: boolean
}

interface SummaryItemProps {
  label: string
  value: number
  type: "neutral" | "positive" | "negative"
}

function SummaryItem({ label, value, type }: SummaryItemProps) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span
        className={cn(
          "font-mono tabular-nums text-sm",
          type === "positive" && "text-green-600",
          type === "negative" && "text-red-600"
        )}
      >
        {type === "positive" && "+"}
        {type === "negative" && "-"}
        {formatIndianNumber(Math.abs(value))}
      </span>
    </div>
  )
}

export function DailySummaryCards({ summary, loading }: DailySummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-20" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-5 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BanknoteIcon className="h-4 w-4 text-green-600" />
            Cash
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <SummaryItem
            label="Opening"
            value={summary.cash.opening}
            type="neutral"
          />
          <SummaryItem
            label="Receipts"
            value={summary.cash.receipts}
            type="positive"
          />
          <SummaryItem
            label="Payments"
            value={summary.cash.payments}
            type="negative"
          />
          <div className="border-t pt-1 mt-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Closing:</span>
              <span className="font-mono tabular-nums font-medium">
                Dr {formatIndianNumber(summary.cash.closing)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BuildingIcon className="h-4 w-4 text-blue-600" />
            Bank
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <SummaryItem
            label="Opening"
            value={summary.bank.opening}
            type="neutral"
          />
          <SummaryItem
            label="Receipts"
            value={summary.bank.receipts}
            type="positive"
          />
          <SummaryItem
            label="Payments"
            value={summary.bank.payments}
            type="negative"
          />
          <div className="border-t pt-1 mt-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Closing:</span>
              <span className="font-mono tabular-nums font-medium">
                Dr {formatIndianNumber(summary.bank.closing)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
