import * as React from "react"
import { loanService } from "../api/loans"
import type { PartyLoanLedger } from "../types"

export function useLoanLedger(partyId: string | null) {
  const [ledger, setLedger] = React.useState<PartyLoanLedger | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchLedger = React.useCallback(async () => {
    if (!partyId) {
      setLedger(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await loanService.getPartyLoanLedger(partyId)
      setLedger(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch loan ledger")
    } finally {
      setLoading(false)
    }
  }, [partyId])

  React.useEffect(() => {
    fetchLedger()
  }, [fetchLedger])

  return { ledger, loading, error, refetch: fetchLedger }
}
