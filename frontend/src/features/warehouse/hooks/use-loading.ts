import * as React from "react"
import { loadingService, type LoadingFilters } from "../api/loading"
import type { Loading, LoadingDetail, RackSuggestion } from "../types/loading"

export function useLoadings(filters?: LoadingFilters) {
  const [loadings, setLoadings] = React.useState<Loading[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchLoadings = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await loadingService.getLoadings(filters)
      setLoadings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch loading records")
    } finally {
      setLoading(false)
    }
  }, [filters?.amad_id, filters?.room_id, filters?.from_date, filters?.to_date])

  React.useEffect(() => {
    fetchLoadings()
  }, [fetchLoadings])

  return { loadings, loading, error, refetch: fetchLoadings }
}

export function useLoadingDetail(id: string | null) {
  const [loadingRecord, setLoadingRecord] = React.useState<LoadingDetail | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchLoading = React.useCallback(async () => {
    if (!id) {
      setLoadingRecord(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await loadingService.getLoading(id)
      setLoadingRecord(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch loading record")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchLoading()
  }, [fetchLoading])

  return { loadingRecord, loading, error, refetch: fetchLoading }
}

export function useLoadingsByAmad(amadId: string | null) {
  const [loadings, setLoadings] = React.useState<Loading[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchLoadings = React.useCallback(async () => {
    if (!amadId) {
      setLoadings([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await loadingService.getByAmad(amadId)
      setLoadings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch loading records")
    } finally {
      setLoading(false)
    }
  }, [amadId])

  React.useEffect(() => {
    fetchLoadings()
  }, [fetchLoadings])

  return { loadings, loading, error, refetch: fetchLoadings }
}

export function useAvailableRacks(roomId: string | null, quantity?: number) {
  const [racks, setRacks] = React.useState<RackSuggestion[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchRacks = React.useCallback(async () => {
    if (!roomId) {
      setRacks([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await loadingService.getAvailableRacks(roomId, quantity)
      setRacks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch available racks")
    } finally {
      setLoading(false)
    }
  }, [roomId, quantity])

  React.useEffect(() => {
    fetchRacks()
  }, [fetchRacks])

  return { racks, loading, error, refetch: fetchRacks }
}
