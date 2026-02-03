import { apiClient } from "@/lib/api-client"
import type {
  Commodity,
  CreateCommodityRequest,
  Room,
  CreateRoomRequest,
  Village,
  CreateVillageRequest,
} from "../types/masters"

export const commodityService = {
  async getCommodities(isActive?: boolean): Promise<Commodity[]> {
    let url = "/api/inventory/commodities/"
    if (isActive !== undefined) {
      url += `?is_active=${isActive}`
    }
    return apiClient.get<Commodity[]>(url)
  },

  async getCommodity(id: string): Promise<Commodity> {
    return apiClient.get<Commodity>(`/api/inventory/commodities/${id}/`)
  },

  async createCommodity(data: CreateCommodityRequest): Promise<Commodity> {
    return apiClient.post<Commodity>("/api/inventory/commodities/", data)
  },

  async updateCommodity(id: string, data: Partial<CreateCommodityRequest>): Promise<Commodity> {
    return apiClient.patch<Commodity>(`/api/inventory/commodities/${id}/`, data)
  },

  async deleteCommodity(id: string): Promise<void> {
    return apiClient.delete(`/api/inventory/commodities/${id}/`)
  },
}

export const roomService = {
  async getRooms(isActive?: boolean): Promise<Room[]> {
    let url = "/api/inventory/rooms/"
    if (isActive !== undefined) {
      url += `?is_active=${isActive}`
    }
    return apiClient.get<Room[]>(url)
  },

  async getRoom(id: string): Promise<Room> {
    return apiClient.get<Room>(`/api/inventory/rooms/${id}/`)
  },

  async createRoom(data: CreateRoomRequest): Promise<Room> {
    return apiClient.post<Room>("/api/inventory/rooms/", data)
  },

  async updateRoom(id: string, data: Partial<CreateRoomRequest>): Promise<Room> {
    return apiClient.patch<Room>(`/api/inventory/rooms/${id}/`, data)
  },

  async deleteRoom(id: string): Promise<void> {
    return apiClient.delete(`/api/inventory/rooms/${id}/`)
  },
}

export const villageService = {
  async getVillages(isActive?: boolean, district?: string): Promise<Village[]> {
    const params = new URLSearchParams()
    if (isActive !== undefined) params.append("is_active", String(isActive))
    if (district) params.append("district", district)
    let url = "/api/inventory/villages/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<Village[]>(url)
  },

  async getVillage(id: string): Promise<Village> {
    return apiClient.get<Village>(`/api/inventory/villages/${id}/`)
  },

  async createVillage(data: CreateVillageRequest): Promise<Village> {
    return apiClient.post<Village>("/api/inventory/villages/", data)
  },

  async updateVillage(id: string, data: Partial<CreateVillageRequest>): Promise<Village> {
    return apiClient.patch<Village>(`/api/inventory/villages/${id}/`, data)
  },

  async deleteVillage(id: string): Promise<void> {
    return apiClient.delete(`/api/inventory/villages/${id}/`)
  },
}
