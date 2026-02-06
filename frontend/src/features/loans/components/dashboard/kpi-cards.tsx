import { Banknote, Landmark, Percent, AlertTriangle } from "lucide-react"
import { StatCard, StatCardSkeleton } from "@/components/ui/stat-card"
import { useLoanStats } from "../../hooks/use-loan-stats"
import { formatCurrency } from "../../utils"

export function LoanKpiCards() {
  const { stats, loading } = useLoanStats()

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
