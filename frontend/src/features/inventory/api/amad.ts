import { apiClient } from "@/lib/api-client"
import type {
  Amad,
  AmadSummary,
  CreateAmadRequest,
  StockSummary,
  PartyStock,
  CommodityStock,
  RoomStock,
  TodaySummary,
} from "../types/amad"

export interface AmadFilters {
  is_fully_dispatched?: boolean
  party_id?: string
  commodity_id?: string
  room_id?: string
  from_date?: string
  to_date?: string
}

export const amadService = {
  async getAmads(filters?: AmadFilters): Promise<AmadSummary[]> {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.is_fully_dispatched !== undefined) {
        params.append("is_fully_dispatched", String(filters.is_fully_dispatched))
      }
      if (filters.party_id) params.append("party_id", filters.party_id)
      if (filters.commodity_id) params.append("commodity_id", filters.commodity_id)
      if (filters.room_id) params.append("room_id", filters.room_id)
      if (filters.from_date) params.append("from_date", filters.from_date)
      if (filters.to_date) params.append("to_date", filters.to_date)
    }
    let url = "/api/inventory/amad/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<AmadSummary[]>(url)
  },

  async getAmad(id: string): Promise<Amad> {
    return apiClient.get<Amad>(`/api/inventory/amad/${id}/`)
  },

  async createAmad(data: CreateAmadRequest): Promise<Amad> {
    return apiClient.post<Amad>("/api/inventory/amad/", data)
  },

  async updateAmad(id: string, data: Partial<CreateAmadRequest>): Promise<Amad> {
    return apiClient.patch<Amad>(`/api/inventory/amad/${id}/`, data)
  },

  async deleteAmad(id: string): Promise<void> {
    return apiClient.delete(`/api/inventory/amad/${id}/`)
  },

  async getSummary(): Promise<StockSummary> {
    return apiClient.get<StockSummary>("/api/inventory/amad/summary/")
  },

  async getPartyStock(partyId: string): Promise<PartyStock> {
    return apiClient.get<PartyStock>(`/api/inventory/amad/party-stock/${partyId}/`)
  },

  async getDueForNikasi(days: number = 180): Promise<AmadSummary[]> {
    return apiClient.get<AmadSummary[]>(`/api/inventory/amad/due_for_nikasi/?days=${days}`)
  },

  async getCommodityStock(): Promise<CommodityStock[]> {
    return apiClient.get<CommodityStock[]>("/api/inventory/amad/commodity_stock/")
  },

  async getRoomStock(): Promise<RoomStock[]> {
    return apiClient.get<RoomStock[]>("/api/inventory/amad/room_stock/")
  },

  async getTodaySummary(date?: string): Promise<TodaySummary> {
    let url = "/api/inventory/amad/today_summary/"
    if (date) url += `?date=${date}`
    return apiClient.get<TodaySummary>(url)
  },
}
