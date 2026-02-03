import * as React from "react"
import { commodityService, roomService, villageService } from "../api/masters"
import type { Commodity, Room, Village } from "../types/masters"

export function useCommodities(isActive?: boolean) {
  const [commodities, setCommodities] = React.useState<Commodity[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchCommodities = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await commodityService.getCommodities(isActive)
      setCommodities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch commodities")
    } finally {
      setLoading(false)
    }
  }, [isActive])

  React.useEffect(() => {
    fetchCommodities()
  }, [fetchCommodities])

  return { commodities, loading, error, refetch: fetchCommodities }
}

export function useRooms(isActive?: boolean) {
  const [rooms, setRooms] = React.useState<Room[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchRooms = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await roomService.getRooms(isActive)
      setRooms(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rooms")
    } finally {
      setLoading(false)
    }
  }, [isActive])

  React.useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  return { rooms, loading, error, refetch: fetchRooms }
}

export function useVillages(isActive?: boolean, district?: string) {
  const [villages, setVillages] = React.useState<Village[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchVillages = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await villageService.getVillages(isActive, district)
      setVillages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch villages")
    } finally {
      setLoading(false)
    }
  }, [isActive, district])

  React.useEffect(() => {
    fetchVillages()
  }, [fetchVillages])

  return { villages, loading, error, refetch: fetchVillages }
}
