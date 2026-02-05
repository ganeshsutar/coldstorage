import { apiClient } from "@/lib/api-client"
import type { GatePass, GatePassCreateRequest, GatePassStatus } from "../types"

export interface GatePassFilters {
  status?: GatePassStatus
  seller_id?: string
  buyer_id?: string
  sauda_id?: string
  from_date?: string
  to_date?: string
}

export const gatePassService = {
  async getGatePasses(filters?: GatePassFilters): Promise<GatePass[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.seller_id) params.append("seller_id", filters.seller_id)
    if (filters?.buyer_id) params.append("buyer_id", filters.buyer_id)
    if (filters?.sauda_id) params.append("sauda_id", filters.sauda_id)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/trading/gate-passes/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<GatePass[]>(url)
  },

  async getGatePass(id: string): Promise<GatePass> {
    return apiClient.get<GatePass>(`/api/trading/gate-passes/${id}/`)
  },

  async createGatePass(data: GatePassCreateRequest): Promise<GatePass> {
    return apiClient.post<GatePass>("/api/trading/gate-passes/", data)
  },

  async markDone(id: string): Promise<GatePass> {
    return apiClient.post<GatePass>(`/api/trading/gate-passes/${id}/mark-done/`, {})
  },

  async cancelGatePass(id: string, reason: string): Promise<GatePass> {
    return apiClient.post<GatePass>(`/api/trading/gate-passes/${id}/cancel/`, { reason })
  },
}
