import * as React from "react"
import { takpattiService, type TakpattiFilters } from "../api/takpatti"
import type { Takpatti } from "../types/takpatti"

export function useTakpattis(filters?: TakpattiFilters) {
  const [takpattis, setTakpattis] = React.useState<Takpatti[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchTakpattis = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await takpattiService.getTakpattis(filters)
      setTakpattis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch takpattis")
    } finally {
      setLoading(false)
    }
  }, [filters])

  React.useEffect(() => {
    fetchTakpattis()
  }, [fetchTakpattis])

  return { takpattis, loading, error, refetch: fetchTakpattis }
}

export function useTakpattiDetail(id: string | null) {
  const [takpatti, setTakpatti] = React.useState<Takpatti | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchTakpatti = React.useCallback(async () => {
    if (!id) {
      setTakpatti(null)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await takpattiService.getTakpatti(id)
      setTakpatti(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch takpatti")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchTakpatti()
  }, [fetchTakpatti])

  return { takpatti, loading, error, refetch: fetchTakpatti }
}
