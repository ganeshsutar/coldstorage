import * as React from "react"
import { loanService } from "../api/loans"
import type { LoanFilters } from "../api/loans"
import type { Loan, CollateralAmad } from "../types"

export function useLoans(filters?: LoanFilters) {
  const [loans, setLoans] = React.useState<Loan[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const filtersKey = JSON.stringify(filters ?? null)

  const fetchLoans = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const parsed = JSON.parse(filtersKey)
      const data = await loanService.getLoans(parsed ?? undefined)
      setLoans(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch loans")
    } finally {
      setLoading(false)
    }
  }, [filtersKey])

  React.useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  return { loans, loading, error, refetch: fetchLoans }
}

export function useLoanDetail(id: string | null) {
  const [loan, setLoan] = React.useState<Loan | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchLoan = React.useCallback(async () => {
    if (!id) {
      setLoan(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await loanService.getLoan(id)
      setLoan(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch loan")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchLoan()
  }, [fetchLoan])

  return { loan, loading, error, refetch: fetchLoan }
}

export function useCollateralAmads(partyId: string | null) {
  const [amads, setAmads] = React.useState<CollateralAmad[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchAmads = React.useCallback(async () => {
    if (!partyId) {
      setAmads([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await loanService.getCollateralAmads(partyId)
      setAmads(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch collateral amads")
    } finally {
      setLoading(false)
    }
  }, [partyId])

  React.useEffect(() => {
    fetchAmads()
  }, [fetchAmads])

  return { amads, loading, error, refetch: fetchAmads }
}
