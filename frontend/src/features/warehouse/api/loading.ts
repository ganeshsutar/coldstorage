import { apiClient } from "@/lib/api-client"
import type {
  Loading,
  LoadingDetail,
  CreateLoadingRequest,
  BulkLoadingRequest,
  RackSuggestion,
} from "../types/loading"
import type { RackContents } from "../types/room-map"

export interface LoadingFilters {
  amad_id?: string
  room_id?: string
  from_date?: string
  to_date?: string
}

export const loadingService = {
  async getLoadings(filters?: LoadingFilters): Promise<Loading[]> {
    const params = new URLSearchParams()
    if (filters?.amad_id) params.append("amad_id", filters.amad_id)
    if (filters?.room_id) params.append("room_id", filters.room_id)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/warehouse/loading/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<Loading[]>(url)
  },

  async getLoading(id: string): Promise<LoadingDetail> {
    return apiClient.get<LoadingDetail>(`/api/warehouse/loading/${id}/`)
  },

  async createLoading(data: CreateLoadingRequest): Promise<Loading> {
    return apiClient.post<Loading>("/api/warehouse/loading/", data)
  },

  async bulkCreateLoading(data: BulkLoadingRequest): Promise<Loading[]> {
    return apiClient.post<Loading[]>("/api/warehouse/loading/bulk_create/", data)
  },

  async updateLoading(id: string, data: Partial<CreateLoadingRequest>): Promise<LoadingDetail> {
    return apiClient.patch<LoadingDetail>(`/api/warehouse/loading/${id}/`, data)
  },

  async deleteLoading(id: string): Promise<void> {
    return apiClient.delete(`/api/warehouse/loading/${id}/`)
  },

  async getRackContents(roomId: string, floor: number, rack: number): Promise<RackContents> {
    return apiClient.get<RackContents>(
      `/api/warehouse/loading/rack-contents/${roomId}/${floor}/${rack}/`
    )
  },

  async getAvailableRacks(roomId: string, quantity?: number): Promise<RackSuggestion[]> {
    let url = `/api/warehouse/loading/available-racks/${roomId}/`
    if (quantity) {
      url += `?quantity=${quantity}`
    }
    return apiClient.get<RackSuggestion[]>(url)
  },

  async getByAmad(amadId: string): Promise<Loading[]> {
    return apiClient.get<Loading[]>(`/api/warehouse/loading/by-amad/${amadId}/`)
  },
}
