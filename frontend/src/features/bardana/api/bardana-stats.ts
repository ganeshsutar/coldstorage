import { apiClient } from "@/lib/api-client"
import type { StockSummary, PartyOutstanding } from "../types"

export const bardanaStatsService = {
  async getStockSummary(): Promise<StockSummary> {
    return apiClient.get<StockSummary>("/api/bardana/stats/stock-summary/")
  },

  async getPartyOutstanding(partyId?: string): Promise<PartyOutstanding | PartyOutstanding[]> {
    if (partyId) {
      return apiClient.get<PartyOutstanding>(
        `/api/bardana/stats/party-outstanding/?party_id=${partyId}`
      )
    }
    return apiClient.get<PartyOutstanding[]>("/api/bardana/stats/party-outstanding/")
  },

  async getAllPartyOutstanding(): Promise<PartyOutstanding[]> {
    return apiClient.get<PartyOutstanding[]>("/api/bardana/stats/party-outstanding/")
  },
}
