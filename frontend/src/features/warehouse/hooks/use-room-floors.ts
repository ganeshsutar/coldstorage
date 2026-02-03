import * as React from "react"
import { roomFloorService } from "../api/room-floor"
import type { RoomFloor } from "../types/room-floor"

export function useRoomFloors(roomId?: string) {
  const [floors, setFloors] = React.useState<RoomFloor[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchFloors = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await roomFloorService.getRoomFloors(roomId)
      setFloors(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch room floors")
    } finally {
      setLoading(false)
    }
  }, [roomId])

  React.useEffect(() => {
    fetchFloors()
  }, [fetchFloors])

  return { floors, loading, error, refetch: fetchFloors }
}

export function useRoomFloorsByRoom(roomId: string) {
  const [floors, setFloors] = React.useState<RoomFloor[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchFloors = React.useCallback(async () => {
    if (!roomId) return

    try {
      setLoading(true)
      setError(null)
      const data = await roomFloorService.getByRoom(roomId)
      setFloors(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch room floors")
    } finally {
      setLoading(false)
    }
  }, [roomId])

  React.useEffect(() => {
    fetchFloors()
  }, [fetchFloors])

  return { floors, loading, error, refetch: fetchFloors }
}
