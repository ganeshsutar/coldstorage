import * as React from "react"
import { loanService } from "../api/loans"
import type { LoanStats } from "../types"

export function useLoanStats() {
  const [stats, setStats] = React.useState<LoanStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchStats = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await loanService.getLoanStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch loan stats")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}
