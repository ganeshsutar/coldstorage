import {
  PackageIcon,
  ScaleIcon,
  TruckIcon,
  AlertTriangleIcon,
} from "lucide-react"

import { StatCard, StatCardSkeleton } from "@/components/ui/stat-card"
import type { StockSummary, TodaySummary } from "../../types/amad"

interface KPICardsProps {
  summary: StockSummary | null
  todaySummary?: TodaySummary | null
  loading?: boolean
}

function formatWeight(kg: number): string {
  if (kg >= 100000) {
    return `${(kg / 100000).toFixed(1)}L kg`
  }
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}K kg`
  }
  return `${kg.toLocaleString("en-IN")} kg`
}

function formatNumber(num: number): string {
  if (num >= 100000) {
    return `${(num / 100000).toFixed(1)}L`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toLocaleString("en-IN")
}

export function KPICards({ summary, todaySummary, loading }: KPICardsProps) {
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
      <div data-testid="amad-kpi-today-inward">
        <StatCard
          title="Today's Inward"
          value={todaySummary?.arrivals.packets ?? 0}
          formatter={formatNumber}
          icon={TruckIcon}
          description={todaySummary ? `${todaySummary.arrivals.count} entries` : undefined}
        />
      </div>
      <div data-testid="amad-kpi-total-stock">
        <StatCard
          title="Total Stock"
          value={summary?.remaining_weight ?? 0}
          formatter={formatWeight}
          icon={PackageIcon}
          description={`${formatNumber(summary?.remaining_packets ?? 0)} packets`}
        />
      </div>
      <div data-testid="amad-kpi-active-amads">
        <StatCard
          title="Active Amads"
          value={summary?.active_amads ?? 0}
          formatter={formatNumber}
          icon={ScaleIcon}
          description={`of ${summary?.total_amads ?? 0} total`}
        />
      </div>
      <div data-testid="amad-kpi-fully-dispatched">
        <StatCard
          title="Fully Dispatched"
          value={summary?.fully_dispatched ?? 0}
          formatter={formatNumber}
          icon={AlertTriangleIcon}
          description="completed"
        />
      </div>
    </div>
  )
}
