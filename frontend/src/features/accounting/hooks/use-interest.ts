import * as React from "react"
import { interestService } from "../api/interest"
import type {
  InterestCalculationParams,
  InterestCalculationResult,
  PendingInterest,
} from "../types/interest"

export function useInterestCalculation() {
  const [result, setResult] = React.useState<InterestCalculationResult | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const calculate = React.useCallback(async (params: InterestCalculationParams) => {
    try {
      setLoading(true)
      setError(null)
      const data = await interestService.calculateInterest(params)
      setResult(data)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to calculate interest"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = React.useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, loading, error, calculate, reset }
}

export function usePendingInterest() {
  const [pending, setPending] = React.useState<PendingInterest[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchPending = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await interestService.getPendingInterest()
      setPending(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pending interest")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchPending()
  }, [fetchPending])

  return { pending, loading, error, refetch: fetchPending }
}
