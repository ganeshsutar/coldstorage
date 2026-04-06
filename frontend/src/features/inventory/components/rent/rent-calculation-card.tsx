import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { RentCalculation } from "../../types/rent"

interface RentCalculationCardProps {
  calculation: RentCalculation | null
  loading?: boolean
}

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function RentCalculationCard({
  calculation,
  loading,
}: RentCalculationCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rent Calculation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!calculation) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rent Calculation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" data-testid="rent-calculation-empty">
            Select an amad and enter quantity to see rent calculation
          </p>
        </CardContent>
      </Card>
    )
  }

  const rows = [
    { label: "Amad No", value: calculation.amad_no },
    { label: "Amad Date", value: formatDate(calculation.amad_date) },
    { label: "Dispatch Date", value: formatDate(calculation.dispatch_date) },
    { label: "Packets", value: calculation.packets.toLocaleString("en-IN") },
    { label: "Weight", value: `${calculation.weight.toLocaleString("en-IN")} kg` },
    { label: "Weight (Quintals)", value: calculation.weight_quintals.toFixed(4) },
    { label: "Storage Days", value: calculation.storage_days },
    { label: "Grace Days", value: calculation.grace_days },
    { label: "Billable Days", value: calculation.billable_days, highlight: true },
    { label: "Rent Rate", value: `${formatCurrency(calculation.rent_rate)}/qtl/month` },
    { label: "Rent Amount", value: formatCurrency(calculation.rent_amount), highlight: true },
    { label: `GST (${calculation.gst_percent}%)`, value: formatCurrency(calculation.gst_amount) },
  ]

  return (
    <Card data-testid="rent-calculation-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Rent Calculation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className={cn("flex justify-between text-sm", row.highlight && "font-medium")}
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-mono">{row.value}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold" data-testid="rent-calculation-total">
              <span>Total Amount</span>
              <span className="font-mono text-lg">
                {formatCurrency(calculation.total_amount)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
