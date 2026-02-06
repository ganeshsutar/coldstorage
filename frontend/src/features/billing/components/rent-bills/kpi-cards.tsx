import { Receipt, IndianRupee, Clock, FileText } from "lucide-react"
import { StatCard, StatCardSkeleton } from "@/components/ui/stat-card"
import { useBillingStats } from "../../hooks/use-billing-stats"
import { formatCompactRupees } from "../../utils/amount-to-words"

export function BillingKpiCards() {
  const { data: stats, isLoading: loading } = useBillingStats()

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
