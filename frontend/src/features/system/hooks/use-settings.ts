import * as React from "react"
import { settingsService } from "../api/settings"
import type {
  BankSettings,
  CompanySettings,
  FinancialYearSettings,
  TaxSettings,
} from "../types"

export function useCompanySettings() {
  const [settings, setSettings] = React.useState<CompanySettings | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchSettings = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await settingsService.getCompanySettings()
      setSettings(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch company settings"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = React.useCallback(
    async (data: Partial<CompanySettings>) => {
      try {
        setError(null)
        const updated = await settingsService.updateCompanySettings(data)
        setSettings(updated)
        return updated
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update company settings"
        setError(message)
        throw err
      }
    },
    []
  )

  return { settings, loading, error, refetch: fetchSettings, updateSettings }
}

export function useTaxSettings() {
  const [settings, setSettings] = React.useState<TaxSettings | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchSettings = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await settingsService.getTaxSettings()
      setSettings(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch tax settings"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = React.useCallback(
    async (data: Partial<TaxSettings>) => {
      try {
        setError(null)
        const updated = await settingsService.updateTaxSettings(data)
        setSettings(updated)
        return updated
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update tax settings"
        setError(message)
        throw err
      }
    },
    []
  )

  return { settings, loading, error, refetch: fetchSettings, updateSettings }
}

export function useBankSettings() {
  const [settings, setSettings] = React.useState<BankSettings | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchSettings = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await settingsService.getBankSettings()
      setSettings(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch bank settings"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = React.useCallback(
    async (data: Partial<BankSettings>) => {
      try {
        setError(null)
        const updated = await settingsService.updateBankSettings(data)
        setSettings(updated)
        return updated
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update bank settings"
        setError(message)
        throw err
      }
    },
    []
  )

  return { settings, loading, error, refetch: fetchSettings, updateSettings }
}

export function useFinancialYearSettings() {
  const [settings, setSettings] =
    React.useState<FinancialYearSettings | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchSettings = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await settingsService.getFinancialYearSettings()
      setSettings(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch financial year settings"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = React.useCallback(
    async (data: Partial<FinancialYearSettings>) => {
      try {
        setError(null)
        const updated = await settingsService.updateFinancialYearSettings(data)
        setSettings(updated)
        return updated
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update financial year settings"
        setError(message)
        throw err
      }
    },
    []
  )

  return { settings, loading, error, refetch: fetchSettings, updateSettings }
}
