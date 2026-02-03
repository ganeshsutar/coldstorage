import * as React from "react"
import { rentService, type RentFilters } from "../api/rent"
import type { Rent, RentSummary, RentCalculation, RentCalculationRequest } from "../types/rent"

export function useRents(filters?: RentFilters) {
  const [rents, setRents] = React.useState<RentSummary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchRents = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await rentService.getRents(filters)
      setRents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rents")
    } finally {
      setLoading(false)
    }
  }, [filters])

  React.useEffect(() => {
    fetchRents()
  }, [fetchRents])

  return { rents, loading, error, refetch: fetchRents }
}

export function useRentDetail(id: string | null) {
  const [rent, setRent] = React.useState<Rent | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchRent = React.useCallback(async () => {
    if (!id) {
      setRent(null)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await rentService.getRent(id)
      setRent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rent")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchRent()
  }, [fetchRent])

  return { rent, loading, error, refetch: fetchRent }
}

export function useRentCalculation() {
  const [calculation, setCalculation] = React.useState<RentCalculation | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const calculate = React.useCallback(async (data: RentCalculationRequest) => {
    try {
      setLoading(true)
      setError(null)
      const result = await rentService.calculateRent(data)
      setCalculation(result)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate rent")
      setCalculation(null)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = React.useCallback(() => {
    setCalculation(null)
    setError(null)
  }, [])

  return { calculation, loading, error, calculate, reset }
}
