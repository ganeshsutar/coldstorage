import * as React from "react"
import { rentBillService } from "../api/rent-bills"
import type { BillingStats, PartyOutstanding } from "../types"

export function useBillingStats() {
  const [stats, setStats] = React.useState<BillingStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchStats = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await rentBillService.getBillingStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch billing stats")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

export function usePartyOutstanding(partyId: string | null) {
  const [outstanding, setOutstanding] = React.useState<PartyOutstanding | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchOutstanding = React.useCallback(async () => {
    if (!partyId) {
      setOutstanding(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await rentBillService.getPartyOutstanding(partyId)
      setOutstanding(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch party outstanding")
    } finally {
      setLoading(false)
    }
  }, [partyId])

  React.useEffect(() => {
    fetchOutstanding()
  }, [fetchOutstanding])

  return { outstanding, loading, error, refetch: fetchOutstanding }
}
