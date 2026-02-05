import * as React from "react"
import { unloadingService, type UnloadingFilters } from "../api/unloading"
import type { Unloading, UnloadingDetail, AmadLocation, UnloadSuggestion } from "../types/unloading"

export function useUnloadings(filters?: UnloadingFilters) {
  const [unloadings, setUnloadings] = React.useState<Unloading[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchUnloadings = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await unloadingService.getUnloadings(filters)
      setUnloadings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch unloading records")
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.amad_id, filters?.rent_id, filters?.room_id, filters?.from_date, filters?.to_date])

  React.useEffect(() => {
    fetchUnloadings()
  }, [fetchUnloadings])

  return { unloadings, loading, error, refetch: fetchUnloadings }
}

export function useUnloadingDetail(id: string | null) {
  const [unloading, setUnloading] = React.useState<UnloadingDetail | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchUnloading = React.useCallback(async () => {
    if (!id) {
      setUnloading(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await unloadingService.getUnloading(id)
      setUnloading(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch unloading record")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchUnloading()
  }, [fetchUnloading])

  return { unloading, loading, error, refetch: fetchUnloading }
}

export function useAmadLocations(amadId: string | null) {
  const [locations, setLocations] = React.useState<AmadLocation[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchLocations = React.useCallback(async () => {
    if (!amadId) {
      setLocations([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await unloadingService.getAvailableToUnload(amadId)
      setLocations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch amad locations")
    } finally {
      setLoading(false)
    }
  }, [amadId])

  React.useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  return { locations, loading, error, refetch: fetchLocations }
}

export function useUnloadSuggestions(amadId: string | null, quantity: number) {
  const [suggestions, setSuggestions] = React.useState<UnloadSuggestion[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchSuggestions = React.useCallback(async () => {
    if (!amadId || quantity <= 0) {
      setSuggestions([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await unloadingService.suggestUnload(amadId, quantity)
      setSuggestions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch unload suggestions")
    } finally {
      setLoading(false)
    }
  }, [amadId, quantity])

  React.useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  return { suggestions, loading, error, refetch: fetchSuggestions }
}
