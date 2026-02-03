import { apiClient } from "@/lib/api-client"
import type { Takpatti, CreateTakpattiRequest } from "../types/takpatti"

export interface TakpattiFilters {
  amad_id?: string
  room_id?: string
  from_date?: string
  to_date?: string
}

export const takpattiService = {
  async getTakpattis(filters?: TakpattiFilters): Promise<Takpatti[]> {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.amad_id) params.append("amad_id", filters.amad_id)
      if (filters.room_id) params.append("room_id", filters.room_id)
      if (filters.from_date) params.append("from_date", filters.from_date)
      if (filters.to_date) params.append("to_date", filters.to_date)
    }
    let url = "/api/inventory/takpatti/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<Takpatti[]>(url)
  },

  async getTakpatti(id: string): Promise<Takpatti> {
    return apiClient.get<Takpatti>(`/api/inventory/takpatti/${id}/`)
  },

  async createTakpatti(data: CreateTakpattiRequest): Promise<Takpatti> {
    return apiClient.post<Takpatti>("/api/inventory/takpatti/", data)
  },

  async updateTakpatti(id: string, data: Partial<CreateTakpattiRequest>): Promise<Takpatti> {
    return apiClient.patch<Takpatti>(`/api/inventory/takpatti/${id}/`, data)
  },

  async deleteTakpatti(id: string): Promise<void> {
    return apiClient.delete(`/api/inventory/takpatti/${id}/`)
  },
}
