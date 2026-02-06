import { TrendingUp, Truck, Clock, Scissors } from "lucide-react"
import { StatCard, StatCardSkeleton } from "@/components/ui/stat-card"
import { useTradingStats } from "../../hooks/use-trading-stats"
import { formatCurrency, formatNumber } from "../../utils"

export function TradingKpiCards() {
  const { stats, loading } = useTradingStats()

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
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
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          description={card.description}
          subValue={card.subValue}
        />
      ))}
    </div>
  )
}
