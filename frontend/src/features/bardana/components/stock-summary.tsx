import { Package, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { useStockSummary } from "../hooks"
import { StockTypeCard } from "./stock-type-card"

export function StockSummary() {
  const { data: summary, isLoading } = useStockSummary()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bardana Stock</h2>
        <p className="text-muted-foreground">
          Overview of packaging material stock and transactions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Stock"
          value={summary?.kpis.total_stock ?? 0}
          icon={Package}
          description="Current available stock"
          loading={isLoading}
        />
        <StatCard
          title="Issued Today"
          value={summary?.kpis.issued_today ?? 0}
          icon={ArrowUpRight}
          description="Bags issued today"
          loading={isLoading}
        />
        <StatCard
          title="Outstanding"
          value={summary?.kpis.total_outstanding ?? 0}
          icon={Clock}
          description="Bags with parties"
          loading={isLoading}
        />
        <StatCard
          title="Returns Pending"
          value={summary?.kpis.returns_pending ?? 0}
          icon={ArrowDownLeft}
          description="Draft returns"
          loading={isLoading}
        />
      </div>

      {summary && summary.types.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Stock by Type</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {summary.types.map((type) => (
              <StockTypeCard key={type.id} type={type} />
            ))}
          </div>
        </div>
      )}

      {summary && summary.types.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No bardana types configured. Go to Bardana Types to add your packaging materials.
        </div>
      )}
    </div>
  )
}
