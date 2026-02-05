import * as React from "react"
import { kataiService } from "../api/katais"
import type { KataiFilters } from "../api/katais"
import type { Katai } from "../types"

export function useKatais(filters?: KataiFilters) {
  const [katais, setKatais] = React.useState<Katai[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const filtersKey = JSON.stringify(filters ?? null)

  const fetchKatais = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const parsed = JSON.parse(filtersKey)
      const data = await kataiService.getKatais(parsed ?? undefined)
      setKatais(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch grading records")
    } finally {
      setLoading(false)
    }
  }, [filtersKey])

  React.useEffect(() => {
    fetchKatais()
  }, [fetchKatais])

  return { katais, loading, error, refetch: fetchKatais }
}
