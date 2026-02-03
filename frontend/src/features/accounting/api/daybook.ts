import { apiClient } from "@/lib/api-client"
import type {
  DaybookSummary,
  DaybookTransaction,
  CloseDayRequest,
} from "../types/daybook"

export const daybookService = {
  async getDaybookSummary(date: string): Promise<DaybookSummary> {
    return apiClient.get<DaybookSummary>(
      `/api/accounting/daybook/?date=${date}`
    )
  },

  async getDaybookTransactions(
    date: string,
    type?: string
  ): Promise<DaybookTransaction[]> {
    let url = `/api/accounting/daybook/transactions/?date=${date}`
    if (type && type !== "all") {
      url += `&type=${type}`
    }
    return apiClient.get<DaybookTransaction[]>(url)
  },

  async closeDay(data: CloseDayRequest): Promise<DaybookSummary> {
    return apiClient.post<DaybookSummary>(
      "/api/accounting/daybook/close/",
      data
    )
  },
}
