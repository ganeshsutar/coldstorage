import { Banknote, Landmark, Percent, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLoanStats } from "../../hooks/use-loan-stats"
import { formatCurrency } from "../../utils"

export function LoanKpiCards() {
  const { stats, loading } = useLoanStats()

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
      title: "Total Advances",
      value: stats?.active_advances_count || 0,
      subValue: stats?.active_advances_balance ? formatCurrency(stats.active_advances_balance) : "₹0",
      icon: Banknote,
      description: "outstanding",
    },
    {
      title: "Active Loans",
      value: stats?.active_loans_count || 0,
      subValue: stats?.active_loans_balance ? formatCurrency(stats.active_loans_balance) : "₹0",
      icon: Landmark,
      description: "outstanding",
    },
    {
      title: "Interest Accrued",
      value: stats?.total_interest_accrued ? formatCurrency(stats.total_interest_accrued) : "₹0",
      icon: Percent,
      description: "on active loans",
    },
    {
      title: "Overdue",
      value: stats?.overdue_advances_count || 0,
      icon: AlertTriangle,
      description: "advances past expected date",
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
            <div className="text-2xl font-bold">{card.value}</div>
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
