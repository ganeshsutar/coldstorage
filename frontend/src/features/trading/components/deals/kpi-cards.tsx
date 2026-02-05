import { TrendingUp, Truck, Clock, Scissors } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTradingStats } from "../../hooks/use-trading-stats"
import { formatCurrency, formatNumber } from "../../utils"

export function TradingKpiCards() {
  const { stats, loading } = useTradingStats()

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
      title: "Open Deals",
      value: stats?.open_deals_count || 0,
      subValue: stats?.open_deals_value ? formatCurrency(stats.open_deals_value) : "₹0",
      icon: TrendingUp,
      description: "total value",
    },
    {
      title: "Dispatched Today",
      value: `${formatNumber(stats?.dispatched_today_bags || 0)} bags`,
      icon: Truck,
      description: `${stats?.dispatched_today_gps || 0} gate passes`,
    },
    {
      title: "Pending Delivery",
      value: stats?.pending_delivery_value ? formatCurrency(stats.pending_delivery_value) : "₹0",
      icon: Clock,
      description: `${stats?.pending_delivery_count || 0} deals`,
    },
    {
      title: "Grading Done",
      value: `${formatNumber(stats?.grading_done_bags || 0)} bags`,
      icon: Scissors,
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
