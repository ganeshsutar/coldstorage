import { apiClient } from "@/lib/api-client"
import type {
  Account,
  AccountTreeNode,
  AccountSummary,
  CreateAccountRequest,
  CreatePartyRequest,
  LedgerEntry,
  PartyAccount,
} from "../types/account"

export const accountsService = {
  async getAccounts(): Promise<Account[]> {
    return apiClient.get<Account[]>("/api/accounting/accounts/")
  },

  async getAccountTree(): Promise<AccountTreeNode[]> {
    return apiClient.get<AccountTreeNode[]>("/api/accounting/accounts/tree/")
  },

  async getAccount(id: string): Promise<Account> {
    return apiClient.get<Account>(`/api/accounting/accounts/${id}/`)
  },

  async createAccount(data: CreateAccountRequest): Promise<Account> {
    return apiClient.post<Account>("/api/accounting/accounts/", data)
  },

  async createParty(data: CreatePartyRequest): Promise<PartyAccount> {
    return apiClient.post<PartyAccount>("/api/accounting/accounts/", {
      ...data,
      is_party: true,
    })
  },

  async getPartyAccounts(): Promise<PartyAccount[]> {
    return apiClient.get<PartyAccount[]>("/api/accounting/accounts/?is_party=true")
  },

  async getAccountSummary(): Promise<AccountSummary> {
    return apiClient.get<AccountSummary>("/api/accounting/accounts/summary/")
  },

  async getLedger(
    accountId: string,
    fromDate?: string,
    toDate?: string
  ): Promise<LedgerEntry[]> {
    let url = `/api/accounting/accounts/${accountId}/ledger/`
    const params = new URLSearchParams()
    if (fromDate) params.append("from_date", fromDate)
    if (toDate) params.append("to_date", toDate)
    if (params.toString()) url += `?${params.toString()}`
    return apiClient.get<LedgerEntry[]>(url)
  },
}
