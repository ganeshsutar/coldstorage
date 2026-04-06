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

function SummaryItem({ label, value, type, "data-testid": testId }: SummaryItemProps & { "data-testid"?: string }) {
  return (
    <div data-testid={testId} className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span
        className={cn(
          "font-mono tabular-nums text-sm",
          type === "positive" && "text-status-success-foreground",
          type === "negative" && "text-status-danger-foreground"
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
    <div data-testid="daily-summary-cards" className="grid md:grid-cols-2 gap-4">
      <Card data-testid="daily-summary-cash-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BanknoteIcon className="size-4 text-status-success-foreground" />
            Cash
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <SummaryItem
            label="Opening"
            value={summary.cash.opening}
            type="neutral"
            data-testid="daily-summary-cash-opening"
          />
          <SummaryItem
            label="Receipts"
            value={summary.cash.receipts}
            type="positive"
            data-testid="daily-summary-cash-receipts"
          />
          <SummaryItem
            label="Payments"
            value={summary.cash.payments}
            type="negative"
            data-testid="daily-summary-cash-payments"
          />
          <div className="border-t pt-1 mt-1">
            <div data-testid="daily-summary-cash-closing" className="flex justify-between items-center">
              <span className="text-sm font-medium">Closing:</span>
              <span className="font-mono tabular-nums font-medium">
                Dr {formatIndianNumber(summary.cash.closing)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="daily-summary-bank-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BuildingIcon className="size-4 text-status-info-foreground" />
            Bank
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <SummaryItem
            label="Opening"
            value={summary.bank.opening}
            type="neutral"
            data-testid="daily-summary-bank-opening"
          />
          <SummaryItem
            label="Receipts"
            value={summary.bank.receipts}
            type="positive"
            data-testid="daily-summary-bank-receipts"
          />
          <SummaryItem
            label="Payments"
            value={summary.bank.payments}
            type="negative"
            data-testid="daily-summary-bank-payments"
          />
          <div className="border-t pt-1 mt-1">
            <div data-testid="daily-summary-bank-closing" className="flex justify-between items-center">
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
