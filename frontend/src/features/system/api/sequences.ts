import { apiClient } from "@/lib/api-client"
import type {
  SequenceConfig,
  UpdateSequenceConfigRequest,
  NextNumberPreview,
} from "../types"

export const sequencesService = {
  getSequences: () =>
    apiClient.get<SequenceConfig[]>("/api/system/sequences/"),

  updateSequence: (id: string, data: UpdateSequenceConfigRequest) =>
    apiClient.patch<SequenceConfig>(`/api/system/sequences/${id}/`, data),

  getNextNumber: (id: string, year?: number) => {
    const params = year ? `?year=${year}` : ""
    return apiClient.get<NextNumberPreview>(
      `/api/system/sequences/${id}/next-number/${params}`
    )
  },

  previewByKey: (key: string, year?: number) => {
    const yearParam = year ? `&year=${year}` : ""
    return apiClient.get<NextNumberPreview>(
      `/api/system/sequences/preview-by-key/?key=${key}${yearParam}`
    )
  },
}
