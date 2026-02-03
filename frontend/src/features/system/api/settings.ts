import { apiClient } from "@/lib/api-client"
import type {
  BankSettings,
  CompanySettings,
  FinancialYearSettings,
  TaxSettings,
} from "../types"

export const settingsService = {
  // Company settings
  async getCompanySettings(): Promise<CompanySettings> {
    return apiClient.get<CompanySettings>("/api/system/settings/company/")
  },

  async updateCompanySettings(
    data: Partial<CompanySettings>
  ): Promise<CompanySettings> {
    return apiClient.patch<CompanySettings>("/api/system/settings/company/", data)
  },

  // Tax settings
  async getTaxSettings(): Promise<TaxSettings> {
    return apiClient.get<TaxSettings>("/api/system/settings/tax/")
  },

  async updateTaxSettings(data: Partial<TaxSettings>): Promise<TaxSettings> {
    return apiClient.patch<TaxSettings>("/api/system/settings/tax/", data)
  },

  // Bank settings
  async getBankSettings(): Promise<BankSettings> {
    return apiClient.get<BankSettings>("/api/system/settings/bank/")
  },

  async updateBankSettings(data: Partial<BankSettings>): Promise<BankSettings> {
    return apiClient.patch<BankSettings>("/api/system/settings/bank/", data)
  },

  // Financial year settings
  async getFinancialYearSettings(): Promise<FinancialYearSettings> {
    return apiClient.get<FinancialYearSettings>(
      "/api/system/settings/financial-year/"
    )
  },

  async updateFinancialYearSettings(
    data: Partial<FinancialYearSettings>
  ): Promise<FinancialYearSettings> {
    return apiClient.patch<FinancialYearSettings>(
      "/api/system/settings/financial-year/",
      data
    )
  },
}
