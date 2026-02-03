import { apiClient } from "@/lib/api-client"
import type {
  Receipt,
  ReceiptCreateRequest,
  RentBillHeader,
  BillStatus,
  PaymentMode,
} from "../types"

export interface ReceiptFilters {
  status?: BillStatus
  party_id?: string
  payment_mode?: PaymentMode
  from_date?: string
  to_date?: string
}

export const receiptService = {
  async getReceipts(filters?: ReceiptFilters): Promise<Receipt[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.party_id) params.append("party_id", filters.party_id)
    if (filters?.payment_mode) params.append("payment_mode", filters.payment_mode)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/billing/receipts/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<Receipt[]>(url)
  },

  async getReceipt(id: string): Promise<Receipt> {
    return apiClient.get<Receipt>(`/api/billing/receipts/${id}/`)
  },

  async getUnpaidBillsByParty(partyId: string): Promise<RentBillHeader[]> {
    return apiClient.get<RentBillHeader[]>(
      `/api/billing/receipts/unpaid-bills/?party_id=${partyId}`
    )
  },

  async createReceipt(data: ReceiptCreateRequest): Promise<Receipt> {
    return apiClient.post<Receipt>("/api/billing/receipts/", data)
  },

  async confirmReceipt(id: string): Promise<Receipt> {
    return apiClient.post<Receipt>(`/api/billing/receipts/${id}/confirm/`, {})
  },

  async cancelReceipt(id: string, reason: string): Promise<Receipt> {
    return apiClient.post<Receipt>(`/api/billing/receipts/${id}/cancel/`, { reason })
  },
}
