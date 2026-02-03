import { apiClient } from "@/lib/api-client"
import type {
  TemperatureThreshold,
  CreateTemperatureThresholdRequest,
  TemperatureReading,
  TemperatureReadingDetail,
  CreateTemperatureReadingRequest,
  TemperatureAlert,
  LatestTemperature,
  MeterReading,
  MeterReadingDetail,
  CreateMeterReadingRequest,
} from "../types/temperature"

export interface TemperatureReadingFilters {
  room_id?: string
  status?: string
  from_date?: string
  to_date?: string
}

// Temperature Threshold Service
export const temperatureThresholdService = {
  async getThresholds(roomId?: string): Promise<TemperatureThreshold[]> {
    let url = "/api/warehouse/temperature-thresholds/"
    if (roomId) url += `?room_id=${roomId}`
    return apiClient.get<TemperatureThreshold[]>(url)
  },

  async getThreshold(id: string): Promise<TemperatureThreshold> {
    return apiClient.get<TemperatureThreshold>(`/api/warehouse/temperature-thresholds/${id}/`)
  },

  async createThreshold(data: CreateTemperatureThresholdRequest): Promise<TemperatureThreshold> {
    return apiClient.post<TemperatureThreshold>("/api/warehouse/temperature-thresholds/", data)
  },

  async updateThreshold(
    id: string,
    data: Partial<CreateTemperatureThresholdRequest>
  ): Promise<TemperatureThreshold> {
    return apiClient.patch<TemperatureThreshold>(`/api/warehouse/temperature-thresholds/${id}/`, data)
  },

  async deleteThreshold(id: string): Promise<void> {
    return apiClient.delete(`/api/warehouse/temperature-thresholds/${id}/`)
  },
}

// Temperature Reading Service
export const temperatureReadingService = {
  async getReadings(filters?: TemperatureReadingFilters): Promise<TemperatureReading[]> {
    const params = new URLSearchParams()
    if (filters?.room_id) params.append("room_id", filters.room_id)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/warehouse/temperature/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<TemperatureReading[]>(url)
  },

  async getReading(id: string): Promise<TemperatureReadingDetail> {
    return apiClient.get<TemperatureReadingDetail>(`/api/warehouse/temperature/${id}/`)
  },

  async createReading(data: CreateTemperatureReadingRequest): Promise<TemperatureReading> {
    return apiClient.post<TemperatureReading>("/api/warehouse/temperature/", data)
  },

  async updateReading(
    id: string,
    data: Partial<CreateTemperatureReadingRequest>
  ): Promise<TemperatureReadingDetail> {
    return apiClient.patch<TemperatureReadingDetail>(`/api/warehouse/temperature/${id}/`, data)
  },

  async deleteReading(id: string): Promise<void> {
    return apiClient.delete(`/api/warehouse/temperature/${id}/`)
  },

  async getAlerts(): Promise<TemperatureAlert[]> {
    return apiClient.get<TemperatureAlert[]>("/api/warehouse/temperature/alerts/")
  },

  async getRoomHistory(roomId: string, days?: number): Promise<TemperatureReading[]> {
    let url = `/api/warehouse/temperature/room-history/${roomId}/`
    if (days) url += `?days=${days}`
    return apiClient.get<TemperatureReading[]>(url)
  },

  async getLatestByRoom(): Promise<LatestTemperature[]> {
    return apiClient.get<LatestTemperature[]>("/api/warehouse/temperature/latest_by_room/")
  },
}

// Meter Reading Service
export const meterReadingService = {
  async getReadings(filters?: { room_id?: string; from_date?: string; to_date?: string }): Promise<MeterReading[]> {
    const params = new URLSearchParams()
    if (filters?.room_id) params.append("room_id", filters.room_id)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/warehouse/meter-readings/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<MeterReading[]>(url)
  },

  async getReading(id: string): Promise<MeterReadingDetail> {
    return apiClient.get<MeterReadingDetail>(`/api/warehouse/meter-readings/${id}/`)
  },

  async createReading(data: CreateMeterReadingRequest): Promise<MeterReading> {
    return apiClient.post<MeterReading>("/api/warehouse/meter-readings/", data)
  },

  async updateReading(id: string, data: Partial<CreateMeterReadingRequest>): Promise<MeterReadingDetail> {
    return apiClient.patch<MeterReadingDetail>(`/api/warehouse/meter-readings/${id}/`, data)
  },

  async deleteReading(id: string): Promise<void> {
    return apiClient.delete(`/api/warehouse/meter-readings/${id}/`)
  },

  async getRoomHistory(roomId: string): Promise<MeterReading[]> {
    return apiClient.get<MeterReading[]>(`/api/warehouse/meter-readings/room-history/${roomId}/`)
  },
}
