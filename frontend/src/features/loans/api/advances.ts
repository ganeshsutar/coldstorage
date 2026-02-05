import { apiClient } from "@/lib/api-client"
import type { Advance, AdvanceCreateRequest, AdvanceStatus } from "../types"

export interface AdvanceFilters {
  status?: AdvanceStatus
  party_id?: string
  from_date?: string
  to_date?: string
}

export const advanceService = {
  async getAdvances(filters?: AdvanceFilters): Promise<Advance[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.party_id) params.append("party_id", filters.party_id)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/loans/advances/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<Advance[]>(url)
  },

  async getAdvance(id: string): Promise<Advance> {
    return apiClient.get<Advance>(`/api/loans/advances/${id}/`)
  },

  async createAdvance(data: AdvanceCreateRequest): Promise<Advance> {
    return apiClient.post<Advance>("/api/loans/advances/", data)
  },

  async cancelAdvance(id: string, reason: string): Promise<Advance> {
    return apiClient.post<Advance>(`/api/loans/advances/${id}/cancel/`, { reason })
  },
}
