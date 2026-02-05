import * as React from "react"
import { saudaService } from "../api/saudas"
import type { TradingStats } from "../types"

export function useTradingStats() {
  const [stats, setStats] = React.useState<TradingStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchStats = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await saudaService.getTradingStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch trading stats")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}
