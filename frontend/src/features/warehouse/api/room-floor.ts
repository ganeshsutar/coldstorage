import { apiClient } from "@/lib/api-client"
import type { RoomFloor, CreateRoomFloorRequest } from "../types/room-floor"

export const roomFloorService = {
  async getRoomFloors(roomId?: string): Promise<RoomFloor[]> {
    let url = "/api/warehouse/room-floors/"
    if (roomId) {
      url += `?room_id=${roomId}`
    }
    return apiClient.get<RoomFloor[]>(url)
  },

  async getRoomFloor(id: string): Promise<RoomFloor> {
    return apiClient.get<RoomFloor>(`/api/warehouse/room-floors/${id}/`)
  },

  async getByRoom(roomId: string): Promise<RoomFloor[]> {
    return apiClient.get<RoomFloor[]>(`/api/warehouse/room-floors/by-room/${roomId}/`)
  },

  async createRoomFloor(data: CreateRoomFloorRequest): Promise<RoomFloor> {
    return apiClient.post<RoomFloor>("/api/warehouse/room-floors/", data)
  },

  async updateRoomFloor(id: string, data: Partial<CreateRoomFloorRequest>): Promise<RoomFloor> {
    return apiClient.patch<RoomFloor>(`/api/warehouse/room-floors/${id}/`, data)
  },

  async deleteRoomFloor(id: string): Promise<void> {
    return apiClient.delete(`/api/warehouse/room-floors/${id}/`)
  },
}
