import { apiClient } from "@/lib/api-client"
import type { Katai, KataiCreateRequest } from "../types"

export interface KataiFilters {
  party_id?: string
  from_date?: string
  to_date?: string
}

export const kataiService = {
  async getKatais(filters?: KataiFilters): Promise<Katai[]> {
    const params = new URLSearchParams()
    if (filters?.party_id) params.append("party_id", filters.party_id)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/trading/katais/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<Katai[]>(url)
  },

  async getKatai(id: string): Promise<Katai> {
    return apiClient.get<Katai>(`/api/trading/katais/${id}/`)
  },

  async createKatai(data: KataiCreateRequest): Promise<Katai> {
    return apiClient.post<Katai>("/api/trading/katais/", data)
  },
}
