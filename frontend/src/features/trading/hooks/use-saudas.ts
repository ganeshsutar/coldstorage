import * as React from "react"
import { saudaService } from "../api/saudas"
import type { SaudaFilters } from "../api/saudas"
import type { Sauda, AvailableAmad } from "../types"

export function useSaudas(filters?: SaudaFilters) {
  const [saudas, setSaudas] = React.useState<Sauda[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const filtersKey = JSON.stringify(filters ?? null)

  const fetchSaudas = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const parsed = JSON.parse(filtersKey)
      const data = await saudaService.getSaudas(parsed ?? undefined)
      setSaudas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch deals")
    } finally {
      setLoading(false)
    }
  }, [filtersKey])

  React.useEffect(() => {
    fetchSaudas()
  }, [fetchSaudas])

  return { saudas, loading, error, refetch: fetchSaudas }
}

export function useSaudaDetail(id: string | null) {
  const [sauda, setSauda] = React.useState<Sauda | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchSauda = React.useCallback(async () => {
    if (!id) {
      setSauda(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await saudaService.getSauda(id)
      setSauda(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch deal")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchSauda()
  }, [fetchSauda])

  return { sauda, loading, error, refetch: fetchSauda }
}

export function useAvailableAmads(saudaId: string | null) {
  const [amads, setAmads] = React.useState<AvailableAmad[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchAmads = React.useCallback(async () => {
    if (!saudaId) {
      setAmads([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await saudaService.getAvailableAmads(saudaId)
      setAmads(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch available amads")
    } finally {
      setLoading(false)
    }
  }, [saudaId])

  React.useEffect(() => {
    fetchAmads()
  }, [fetchAmads])

  return { amads, loading, error, refetch: fetchAmads }
}
