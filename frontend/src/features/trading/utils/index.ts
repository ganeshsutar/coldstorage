import type { DealStatus, GatePassStatus } from "../types"

export function getDealStatusColor(
  status: DealStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "OPEN":
      return "default"
    case "PARTIAL":
      return "outline"
    case "DISPATCHED":
      return "secondary"
    case "COMPLETED":
      return "default"
    case "CANCELLED":
      return "destructive"
    default:
      return "secondary"
  }
}

export function getGatePassStatusColor(
  status: GatePassStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "DRAFT":
      return "secondary"
    case "DONE":
      return "default"
    case "CANCELLED":
      return "destructive"
    default:
      return "secondary"
  }
}

export function formatDealProgress(dispatched: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((dispatched / total) * 100))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}
