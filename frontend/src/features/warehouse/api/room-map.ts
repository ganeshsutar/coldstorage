import { apiClient } from "@/lib/api-client"
import type { RoomMap, RackOccupancy } from "../types/room-map"

export const roomMapService = {
  async getRoomMap(roomId: string): Promise<RoomMap> {
    return apiClient.get<RoomMap>(`/api/warehouse/room-map/${roomId}/`)
  },

  async recalculateOccupancy(roomId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/api/warehouse/room-map/recalculate/${roomId}/`, {})
  },

  async getRackOccupancy(filters?: {
    room_id?: string
    floor_number?: number
  }): Promise<RackOccupancy[]> {
    const params = new URLSearchParams()
    if (filters?.room_id) params.append("room_id", filters.room_id)
    if (filters?.floor_number) params.append("floor_number", String(filters.floor_number))

    let url = "/api/warehouse/rack-occupancy/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<RackOccupancy[]>(url)
  },
}
