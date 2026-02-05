import { apiClient } from "@/lib/api-client"
import type {
  Sauda,
  SaudaCreateRequest,
  DealStatus,
  TradingStats,
  AvailableAmad,
} from "../types"

export interface SaudaFilters {
  status?: DealStatus
  seller_id?: string
  buyer_id?: string
  from_date?: string
  to_date?: string
}

export const saudaService = {
  async getSaudas(filters?: SaudaFilters): Promise<Sauda[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.seller_id) params.append("seller_id", filters.seller_id)
    if (filters?.buyer_id) params.append("buyer_id", filters.buyer_id)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/trading/saudas/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<Sauda[]>(url)
  },

  async getSauda(id: string): Promise<Sauda> {
    return apiClient.get<Sauda>(`/api/trading/saudas/${id}/`)
  },

  async createSauda(data: SaudaCreateRequest): Promise<Sauda> {
    return apiClient.post<Sauda>("/api/trading/saudas/", data)
  },

  async cancelSauda(id: string, reason: string): Promise<Sauda> {
    return apiClient.post<Sauda>(`/api/trading/saudas/${id}/cancel/`, { reason })
  },

  async getTradingStats(): Promise<TradingStats> {
    return apiClient.get<TradingStats>("/api/trading/saudas/stats/")
  },

  async getAvailableAmads(saudaId: string): Promise<AvailableAmad[]> {
    return apiClient.get<AvailableAmad[]>(`/api/trading/saudas/${saudaId}/available-amads/`)
  },
}
