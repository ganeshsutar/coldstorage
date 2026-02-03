import * as React from "react"
import { laborRateService } from "../api/labor-rates"
import type { LaborRate, CurrentLaborRates, RateType } from "../types"

export function useLaborRates(isActive?: boolean, rateType?: RateType) {
  const [laborRates, setLaborRates] = React.useState<LaborRate[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchLaborRates = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await laborRateService.getLaborRates(isActive, rateType)
      setLaborRates(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch labor rates")
    } finally {
      setLoading(false)
    }
  }, [isActive, rateType])

  React.useEffect(() => {
    fetchLaborRates()
  }, [fetchLaborRates])

  return { laborRates, loading, error, refetch: fetchLaborRates }
}

export function useCurrentLaborRates() {
  const [rates, setRates] = React.useState<CurrentLaborRates | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchCurrentRates = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await laborRateService.getCurrentRates()
      setRates(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch current rates")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchCurrentRates()
  }, [fetchCurrentRates])

  return { rates, loading, error, refetch: fetchCurrentRates }
}
