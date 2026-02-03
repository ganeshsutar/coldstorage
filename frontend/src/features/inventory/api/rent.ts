import { apiClient } from "@/lib/api-client"
import type {
  Rent,
  RentSummary,
  CreateRentRequest,
  RentCalculationRequest,
  RentCalculation,
  StockTransferRequest,
} from "../types/rent"
import type { Amad } from "../types/amad"

export interface RentFilters {
  party_id?: string
  amad_id?: string
  from_date?: string
  to_date?: string
}

export const rentService = {
  async getRents(filters?: RentFilters): Promise<RentSummary[]> {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.party_id) params.append("party_id", filters.party_id)
      if (filters.amad_id) params.append("amad_id", filters.amad_id)
      if (filters.from_date) params.append("from_date", filters.from_date)
      if (filters.to_date) params.append("to_date", filters.to_date)
    }
    let url = "/api/inventory/rent/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<RentSummary[]>(url)
  },

  async getRent(id: string): Promise<Rent> {
    return apiClient.get<Rent>(`/api/inventory/rent/${id}/`)
  },

  async createRent(data: CreateRentRequest): Promise<Rent> {
    return apiClient.post<Rent>("/api/inventory/rent/", data)
  },

  async calculateRent(data: RentCalculationRequest): Promise<RentCalculation> {
    return apiClient.post<RentCalculation>("/api/inventory/rent/calculate_rent/", data)
  },

  async createWithLedger(data: CreateRentRequest): Promise<Rent> {
    return apiClient.post<Rent>("/api/inventory/rent/create_with_ledger/", data)
  },

  async transferStock(data: StockTransferRequest): Promise<{ message: string; new_amad: Amad }> {
    return apiClient.post<{ message: string; new_amad: Amad }>(
      "/api/inventory/rent/transfer_stock/",
      data
    )
  },
}
