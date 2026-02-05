import { apiClient } from "@/lib/api-client"
import type {
  Loan,
  LoanCreateRequest,
  LoanStatus,
  CollateralAmad,
  PartyLoanLedger,
  LoanStats,
  InterestCalculationItem,
} from "../types"

export interface LoanFilters {
  status?: LoanStatus
  party_id?: string
  amad_id?: string
  from_date?: string
  to_date?: string
}

export const loanService = {
  async getLoans(filters?: LoanFilters): Promise<Loan[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.party_id) params.append("party_id", filters.party_id)
    if (filters?.amad_id) params.append("amad_id", filters.amad_id)
    if (filters?.from_date) params.append("from_date", filters.from_date)
    if (filters?.to_date) params.append("to_date", filters.to_date)

    let url = "/api/loans/loans/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<Loan[]>(url)
  },

  async getLoan(id: string): Promise<Loan> {
    return apiClient.get<Loan>(`/api/loans/loans/${id}/`)
  },

  async createLoan(data: LoanCreateRequest): Promise<Loan> {
    return apiClient.post<Loan>("/api/loans/loans/", data)
  },

  async cancelLoan(id: string, reason: string): Promise<Loan> {
    return apiClient.post<Loan>(`/api/loans/loans/${id}/cancel/`, { reason })
  },

  async getCollateralAmads(partyId: string): Promise<CollateralAmad[]> {
    return apiClient.get<CollateralAmad[]>(
      `/api/loans/loans/collateral-amads/?party_id=${partyId}`
    )
  },

  async getPartyLoanLedger(partyId: string): Promise<PartyLoanLedger> {
    return apiClient.get<PartyLoanLedger>(
      `/api/loans/loans/party-ledger/?party_id=${partyId}`
    )
  },

  async getLoanStats(): Promise<LoanStats> {
    return apiClient.get<LoanStats>("/api/loans/advances/stats/")
  },

  async calculateInterest(
    partyId?: string,
    toDate?: string
  ): Promise<InterestCalculationItem[]> {
    const params = new URLSearchParams()
    if (partyId) params.append("party_id", partyId)
    if (toDate) params.append("to_date", toDate)

    let url = "/api/loans/loans/calculate-interest/"
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<InterestCalculationItem[]>(url)
  },
}
