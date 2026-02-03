import * as React from "react"
import { roomMapService } from "../api/room-map"
import { loadingService } from "../api/loading"
import type { RoomMap, RackContents, RackOccupancy } from "../types/room-map"

export function useRoomMap(roomId: string | null) {
  const [map, setMap] = React.useState<RoomMap | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchMap = React.useCallback(async () => {
    if (!roomId) {
      setMap(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await roomMapService.getRoomMap(roomId)
      setMap(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch room map")
    } finally {
      setLoading(false)
    }
  }, [roomId])

  React.useEffect(() => {
    fetchMap()
  }, [fetchMap])

  return { map, loading, error, refetch: fetchMap }
}

export function useRackContents(
  roomId: string | null,
  floorNumber: number | null,
  rackNumber: number | null
) {
  const [contents, setContents] = React.useState<RackContents | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchContents = React.useCallback(async () => {
    if (!roomId || floorNumber === null || rackNumber === null) {
      setContents(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await loadingService.getRackContents(roomId, floorNumber, rackNumber)
      setContents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rack contents")
    } finally {
      setLoading(false)
    }
  }, [roomId, floorNumber, rackNumber])

  React.useEffect(() => {
    fetchContents()
  }, [fetchContents])

  return { contents, loading, error, refetch: fetchContents }
}

export function useRackOccupancy(roomId?: string, floorNumber?: number) {
  const [occupancy, setOccupancy] = React.useState<RackOccupancy[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchOccupancy = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await roomMapService.getRackOccupancy({
        room_id: roomId,
        floor_number: floorNumber,
      })
      setOccupancy(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rack occupancy")
    } finally {
      setLoading(false)
    }
  }, [roomId, floorNumber])

  React.useEffect(() => {
    fetchOccupancy()
  }, [fetchOccupancy])

  return { occupancy, loading, error, refetch: fetchOccupancy }
}
