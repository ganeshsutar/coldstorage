import { apiClient } from "@/lib/api-client"
import type {
  InterestCalculationParams,
  InterestCalculationResult,
  PendingInterest,
  PostInterestRequest,
} from "../types/interest"

export const interestService = {
  async calculateInterest(
    params: InterestCalculationParams
  ): Promise<InterestCalculationResult> {
    return apiClient.post<InterestCalculationResult>(
      "/api/accounting/interest/calculate/",
      params
    )
  },

  async postInterest(data: PostInterestRequest): Promise<{ voucher_id: string }> {
    return apiClient.post<{ voucher_id: string }>(
      "/api/accounting/interest/post/",
      data
    )
  },

  async getPendingInterest(): Promise<PendingInterest[]> {
    return apiClient.get<PendingInterest[]>("/api/accounting/interest/pending/")
  },
}
