import { apiClient } from "@/lib/api-client"
import type { GstRate, CreateGstRateRequest } from "../types"

export const gstRateService = {
  async getGstRates(isActive?: boolean): Promise<GstRate[]> {
    let url = "/api/masters/gst-rates/"
    if (isActive !== undefined) {
      url += `?is_active=${isActive}`
    }
    return apiClient.get<GstRate[]>(url)
  },

  async getGstRate(id: string): Promise<GstRate> {
    return apiClient.get<GstRate>(`/api/masters/gst-rates/${id}/`)
  },

  async getDefaultGstRate(): Promise<GstRate> {
    return apiClient.get<GstRate>("/api/masters/gst-rates/default/")
  },

  async createGstRate(data: CreateGstRateRequest): Promise<GstRate> {
    return apiClient.post<GstRate>("/api/masters/gst-rates/", data)
  },

  async updateGstRate(id: string, data: Partial<CreateGstRateRequest>): Promise<GstRate> {
    return apiClient.patch<GstRate>(`/api/masters/gst-rates/${id}/`, data)
  },

  async deleteGstRate(id: string): Promise<void> {
    return apiClient.delete(`/api/masters/gst-rates/${id}/`)
  },
}
