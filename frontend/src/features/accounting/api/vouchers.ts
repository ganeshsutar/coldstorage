import { apiClient } from "@/lib/api-client"
import type { Voucher, CreateVoucherRequest } from "../types/voucher"

export const vouchersService = {
  async getVouchers(params?: {
    date?: string
    type?: string
  }): Promise<Voucher[]> {
    let url = "/api/accounting/vouchers/"
    const searchParams = new URLSearchParams()
    if (params?.date) searchParams.append("date", params.date)
    if (params?.type) searchParams.append("type", params.type)
    if (searchParams.toString()) url += `?${searchParams.toString()}`
    return apiClient.get<Voucher[]>(url)
  },

  async getVoucher(id: string): Promise<Voucher> {
    return apiClient.get<Voucher>(`/api/accounting/vouchers/${id}/`)
  },

  async createVoucher(data: CreateVoucherRequest): Promise<Voucher> {
    return apiClient.post<Voucher>("/api/accounting/vouchers/", data)
  },

  async getNextVoucherNumber(type: string): Promise<{ voucher_no: string }> {
    return apiClient.get<{ voucher_no: string }>(
      `/api/accounting/vouchers/next-number/?type=${type}`
    )
  },
}
