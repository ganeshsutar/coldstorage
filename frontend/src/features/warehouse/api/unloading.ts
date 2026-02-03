import { apiClient } from "@/lib/api-client"
import type {
  Unloading,
  UnloadingDetail,
  CreateUnloadingRequest,
  AmadLocation,
  UnloadSuggestion,
} from "../types/unloading"

export interface UnloadingFilters {
  amad_id?: string
  rent_id?: string
  room_id?: string
  from_date?: string
  to_date?: string
}

export const unloadingService = {
  async getUnloadings(filters?: UnloadingFilters): Promise<Unloading[]> {
    const params = new URLSearchParams()
    if (filters?.amad_id) params.append("amad_id", filters.amad_id)
    if (filters?.rent_id) params.append("rent_id", filters.rent_id)
    if (filters?.room_id) params.append("room_id", filters.room_id)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/warehouse/unloading/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<Unloading[]>(url)
  },

  async getUnloading(id: string): Promise<UnloadingDetail> {
    return apiClient.get<UnloadingDetail>(`/api/warehouse/unloading/${id}/`)
  },

  async createUnloading(data: CreateUnloadingRequest): Promise<Unloading> {
    return apiClient.post<Unloading>("/api/warehouse/unloading/", data)
  },

  async updateUnloading(id: string, data: Partial<CreateUnloadingRequest>): Promise<UnloadingDetail> {
    return apiClient.patch<UnloadingDetail>(`/api/warehouse/unloading/${id}/`, data)
  },

  async deleteUnloading(id: string): Promise<void> {
    return apiClient.delete(`/api/warehouse/unloading/${id}/`)
  },

  async getByRent(rentId: string): Promise<Unloading[]> {
    return apiClient.get<Unloading[]>(`/api/warehouse/unloading/by-rent/${rentId}/`)
  },

  async getAvailableToUnload(amadId: string): Promise<AmadLocation[]> {
    return apiClient.get<AmadLocation[]>(`/api/warehouse/unloading/available-to-unload/${amadId}/`)
  },

  async suggestUnload(amadId: string, quantity: number): Promise<UnloadSuggestion[]> {
    return apiClient.get<UnloadSuggestion[]>(
      `/api/warehouse/unloading/suggest-unload/${amadId}/?quantity=${quantity}`
    )
  },
}
