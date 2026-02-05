import { Receipt, IndianRupee, Clock, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBillingStats } from "../../hooks/use-billing-stats"
import { formatCompactRupees } from "../../utils/amount-to-words"

export function BillingKpiCards() {
  const { data: stats, isLoading: loading } = useBillingStats()

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: "Bills This Month",
      value: stats?.bills_this_month || 0,
      subValue: stats?.bills_amount ? formatCompactRupees(stats.bills_amount) : "₹0",
      icon: FileText,
      description: "total value",
    },
    {
      title: "Pending Amount",
      value: stats?.pending_amount ? formatCompactRupees(stats.pending_amount) : "₹0",
      icon: Clock,
      description: "outstanding",
    },
    {
      title: "Collections",
      value: stats?.collections_this_month
        ? formatCompactRupees(stats.collections_this_month)
        : "₹0",
      icon: IndianRupee,
      description: "this month",
    },
    {
      title: "GST Payable",
      value: stats?.gst_payable ? formatCompactRupees(stats.gst_payable) : "₹0",
      icon: Receipt,
      description: "this month",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof card.value === "number" ? card.value : card.value}
            </div>
            {card.subValue && (
              <p className="text-xs text-muted-foreground">
                {card.subValue} {card.description}
              </p>
            )}
            {!card.subValue && card.description && (
              <p className="text-xs text-muted-foreground">{card.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
