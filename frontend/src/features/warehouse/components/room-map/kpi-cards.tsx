import * as React from "react"
import { Package, Warehouse, Thermometer, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import type { RoomSummary } from "../../types/room-map"

interface KpiCardsProps {
  summary: RoomSummary | null
  todayLoading?: number
  temperatureStatus?: "NORMAL" | "WARNING" | "CRITICAL" | "OFFLINE"
  loading?: boolean
}

export function KpiCards({
  summary,
  todayLoading = 0,
  temperatureStatus = "NORMAL",
  loading,
}: KpiCardsProps) {
  const tempColor =
    temperatureStatus === "NORMAL"
      ? "text-green-600"
      : temperatureStatus === "WARNING"
      ? "text-amber-600"
      : temperatureStatus === "CRITICAL"
      ? "text-red-600"
      : "text-gray-600"

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Capacity"
        value={summary?.total_racks ?? 0}
        description={`${summary?.total_capacity ?? 0} bags capacity`}
        icon={Warehouse}
        loading={loading}
      />
      <StatCard
        title="Available Space"
        value={`${summary ? summary.total_racks - summary.occupied_racks : 0}`}
        description={`${summary ? (100 - Number(summary.occupancy_percent)).toFixed(1) : 0}% free`}
        icon={Package}
        loading={loading}
      />
      <StatCard
        title="Today's Loading"
        value={todayLoading}
        description="Bags loaded today"
        icon={TrendingUp}
        loading={loading}
      />
      <StatCard
        title="Temperature Status"
        value={temperatureStatus}
        description="Room temperature"
        icon={Thermometer}
        loading={loading}
        valueClassName={tempColor}
      />
    </div>
  )
}
