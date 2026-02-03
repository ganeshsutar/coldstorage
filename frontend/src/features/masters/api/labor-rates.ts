import { apiClient } from "@/lib/api-client"
import type { LaborRate, CreateLaborRateRequest, CurrentLaborRates, RateType } from "../types"

export const laborRateService = {
  async getLaborRates(isActive?: boolean, rateType?: RateType): Promise<LaborRate[]> {
    const params = new URLSearchParams()
    if (isActive !== undefined) params.append("is_active", String(isActive))
    if (rateType) params.append("rate_type", rateType)
    let url = "/api/masters/labor-rates/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<LaborRate[]>(url)
  },

  async getLaborRate(id: string): Promise<LaborRate> {
    return apiClient.get<LaborRate>(`/api/masters/labor-rates/${id}/`)
  },

  async getLaborRatesByType(type: RateType): Promise<LaborRate[]> {
    return apiClient.get<LaborRate[]>(`/api/masters/labor-rates/by-type/?type=${type}`)
  },

  async getCurrentRates(): Promise<CurrentLaborRates> {
    return apiClient.get<CurrentLaborRates>("/api/masters/labor-rates/current/")
  },

  async createLaborRate(data: CreateLaborRateRequest): Promise<LaborRate> {
    return apiClient.post<LaborRate>("/api/masters/labor-rates/", data)
  },

  async updateLaborRate(id: string, data: Partial<CreateLaborRateRequest>): Promise<LaborRate> {
    return apiClient.patch<LaborRate>(`/api/masters/labor-rates/${id}/`, data)
  },

  async deleteLaborRate(id: string): Promise<void> {
    return apiClient.delete(`/api/masters/labor-rates/${id}/`)
  },
}
