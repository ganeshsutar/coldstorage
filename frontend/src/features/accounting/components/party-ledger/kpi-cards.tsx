import { UsersIcon, CreditCardIcon, ReceiptIcon, PercentIcon } from "lucide-react"

import { StatCard, StatCardSkeleton } from "@/components/ui/stat-card"
import type { AccountSummary } from "../../types/account"
import { formatCompactCurrency } from "../../utils/format-currency"

interface KPICardsProps {
  summary: AccountSummary | null
  loading?: boolean
}

export function KPICards({ summary, loading }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div data-testid="kpi-debtors">
        <StatCard
          title="Debtors"
          value={summary?.total_debtors ?? 0}
          formatter={formatCompactCurrency}
          icon={UsersIcon}
        />
      </div>
      <div data-testid="kpi-creditors">
        <StatCard
          title="Creditors"
          value={summary?.total_creditors ?? 0}
          formatter={formatCompactCurrency}
          icon={CreditCardIcon}
        />
      </div>
      <div data-testid="kpi-todays-receipts">
        <StatCard
          title="Today's Receipts"
          value={summary?.todays_receipts ?? 0}
          formatter={formatCompactCurrency}
          icon={ReceiptIcon}
        />
      </div>
      <div data-testid="kpi-pending-interest">
        <StatCard
          title="Pending Interest"
          value={summary?.pending_interest ?? 0}
          formatter={formatCompactCurrency}
          icon={PercentIcon}
        />
      </div>
    </div>
  )
}
