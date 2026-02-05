import { apiClient } from "@/lib/api-client"
import type {
  BardanaReturnHeader,
  BardanaReturnCreateRequest,
  BardanaReturnFilters,
} from "../types"

export const bardanaReturnService = {
  async getAll(filters?: BardanaReturnFilters): Promise<BardanaReturnHeader[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.party_id) params.append("party_id", filters.party_id)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/bardana/returns/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<BardanaReturnHeader[]>(url)
  },

  async get(id: string): Promise<BardanaReturnHeader> {
    return apiClient.get<BardanaReturnHeader>(`/api/bardana/returns/${id}/`)
  },

  async create(data: BardanaReturnCreateRequest): Promise<BardanaReturnHeader> {
    return apiClient.post<BardanaReturnHeader>("/api/bardana/returns/", data)
  },

  async confirm(id: string): Promise<BardanaReturnHeader> {
    return apiClient.post<BardanaReturnHeader>(`/api/bardana/returns/${id}/confirm/`, {})
  },

  async cancel(id: string, reason: string): Promise<BardanaReturnHeader> {
    return apiClient.post<BardanaReturnHeader>(`/api/bardana/returns/${id}/cancel/`, { reason })
  },
}
