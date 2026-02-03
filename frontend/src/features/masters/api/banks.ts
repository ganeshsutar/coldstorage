import { apiClient } from "@/lib/api-client"
import type { Bank, CreateBankRequest } from "../types"

export const bankService = {
  async getBanks(isActive?: boolean, search?: string): Promise<Bank[]> {
    const params = new URLSearchParams()
    if (isActive !== undefined) params.append("is_active", String(isActive))
    if (search) params.append("search", search)
    let url = "/api/masters/banks/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<Bank[]>(url)
  },

  async getBank(id: string): Promise<Bank> {
    return apiClient.get<Bank>(`/api/masters/banks/${id}/`)
  },

  async createBank(data: CreateBankRequest): Promise<Bank> {
    return apiClient.post<Bank>("/api/masters/banks/", data)
  },

  async updateBank(id: string, data: Partial<CreateBankRequest>): Promise<Bank> {
    return apiClient.patch<Bank>(`/api/masters/banks/${id}/`, data)
  },

  async deleteBank(id: string): Promise<void> {
    return apiClient.delete(`/api/masters/banks/${id}/`)
  },
}
