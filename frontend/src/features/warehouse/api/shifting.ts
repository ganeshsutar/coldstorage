import { apiClient } from "@/lib/api-client"
import type {
  ShiftHeader,
  ShiftHeaderDetail,
  ShiftingItem,
  CreateShiftHeaderRequest,
  ShiftValidationResult,
} from "../types/shifting"

export interface ShiftFilters {
  from_room_id?: string
  to_room_id?: string
  from_date?: string
  to_date?: string
}

export const shiftingService = {
  async getShiftHeaders(filters?: ShiftFilters): Promise<ShiftHeader[]> {
    const params = new URLSearchParams()
    if (filters?.from_room_id) params.append("from_room_id", filters.from_room_id)
    if (filters?.to_room_id) params.append("to_room_id", filters.to_room_id)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/warehouse/shift-headers/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<ShiftHeader[]>(url)
  },

  async getShiftHeader(id: string): Promise<ShiftHeaderDetail> {
    return apiClient.get<ShiftHeaderDetail>(`/api/warehouse/shift-headers/${id}/`)
  },

  async createShiftHeader(data: CreateShiftHeaderRequest): Promise<ShiftHeaderDetail> {
    return apiClient.post<ShiftHeaderDetail>("/api/warehouse/shift-headers/", data)
  },

  async validateShift(data: CreateShiftHeaderRequest): Promise<ShiftValidationResult> {
    return apiClient.post<ShiftValidationResult>("/api/warehouse/shift-headers/validate/", data)
  },

  async deleteShiftHeader(id: string): Promise<void> {
    return apiClient.delete(`/api/warehouse/shift-headers/${id}/`)
  },

  async getShiftingItems(filters?: { amad_id?: string; shift_header_id?: string }): Promise<ShiftingItem[]> {
    const params = new URLSearchParams()
    if (filters?.amad_id) params.append("amad_id", filters.amad_id)
    if (filters?.shift_header_id) params.append("shift_header_id", filters.shift_header_id)

    let url = "/api/warehouse/shifting/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<ShiftingItem[]>(url)
  },
}
