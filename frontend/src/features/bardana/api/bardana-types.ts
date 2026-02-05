import { apiClient } from "@/lib/api-client"
import type { BardanaType } from "../types"

export const bardanaTypeService = {
  async getAll(): Promise<BardanaType[]> {
    return apiClient.get<BardanaType[]>("/api/bardana/types/")
  },

  async get(id: string): Promise<BardanaType> {
    return apiClient.get<BardanaType>(`/api/bardana/types/${id}/`)
  },

  async create(data: Partial<BardanaType>): Promise<BardanaType> {
    return apiClient.post<BardanaType>("/api/bardana/types/", data)
  },

  async update(id: string, data: Partial<BardanaType>): Promise<BardanaType> {
    return apiClient.patch<BardanaType>(`/api/bardana/types/${id}/`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/bardana/types/${id}/`)
  },
}
