import { apiClient } from "@/lib/api-client"
import type {
  RentBillHeader,
  RentBillCreateRequest,
  BillableAmad,
  BillingStats,
  PartyOutstanding,
  BillStatus,
} from "../types"

export interface RentBillFilters {
  status?: BillStatus
  party_id?: string
  from_date?: string
  to_date?: string
}

export const rentBillService = {
  async getRentBills(filters?: RentBillFilters): Promise<RentBillHeader[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.party_id) params.append("party_id", filters.party_id)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/billing/rent-bills/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<RentBillHeader[]>(url)
  },

  async getRentBill(id: string): Promise<RentBillHeader> {
    return apiClient.get<RentBillHeader>(`/api/billing/rent-bills/${id}/`)
  },

  async getBillableAmads(partyId?: string): Promise<BillableAmad[]> {
    let url = "/api/billing/rent-bills/billable-amads/"
    if (partyId) url += `?party_id=${partyId}`
    return apiClient.get<BillableAmad[]>(url)
  },

  async createRentBill(data: RentBillCreateRequest): Promise<RentBillHeader> {
    return apiClient.post<RentBillHeader>("/api/billing/rent-bills/", data)
  },

  async confirmRentBill(id: string): Promise<RentBillHeader> {
    return apiClient.post<RentBillHeader>(`/api/billing/rent-bills/${id}/confirm/`, {})
  },

  async cancelRentBill(id: string, reason: string): Promise<RentBillHeader> {
    return apiClient.post<RentBillHeader>(`/api/billing/rent-bills/${id}/cancel/`, { reason })
  },

  async getBillingStats(): Promise<BillingStats> {
    return apiClient.get<BillingStats>("/api/billing/rent-bills/stats/")
  },

  async getPartyOutstanding(partyId: string): Promise<PartyOutstanding> {
    return apiClient.get<PartyOutstanding>(
      `/api/billing/rent-bills/party-outstanding/?party_id=${partyId}`
    )
  },
}
