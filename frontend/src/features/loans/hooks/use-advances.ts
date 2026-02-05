import * as React from "react"
import { advanceService } from "../api/advances"
import type { AdvanceFilters } from "../api/advances"
import type { Advance } from "../types"

export function useAdvances(filters?: AdvanceFilters) {
  const [advances, setAdvances] = React.useState<Advance[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const filtersKey = JSON.stringify(filters ?? null)

  const fetchAdvances = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const parsed = JSON.parse(filtersKey)
      const data = await advanceService.getAdvances(parsed ?? undefined)
      setAdvances(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch advances")
    } finally {
      setLoading(false)
    }
  }, [filtersKey])

  React.useEffect(() => {
    fetchAdvances()
  }, [fetchAdvances])

  return { advances, loading, error, refetch: fetchAdvances }
}

export function useAdvanceDetail(id: string | null) {
  const [advance, setAdvance] = React.useState<Advance | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchAdvance = React.useCallback(async () => {
    if (!id) {
      setAdvance(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await advanceService.getAdvance(id)
      setAdvance(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch advance")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchAdvance()
  }, [fetchAdvance])

  return { advance, loading, error, refetch: fetchAdvance }
}
