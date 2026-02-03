import * as React from "react"
import { bankService } from "../api/banks"
import type { Bank } from "../types"

export function useBanks(isActive?: boolean, search?: string) {
  const [banks, setBanks] = React.useState<Bank[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchBanks = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bankService.getBanks(isActive, search)
      setBanks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch banks")
    } finally {
      setLoading(false)
    }
  }, [isActive, search])

  React.useEffect(() => {
    fetchBanks()
  }, [fetchBanks])

  return { banks, loading, error, refetch: fetchBanks }
}
