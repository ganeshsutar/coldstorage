import * as React from "react"
import { accountsService } from "../api/accounts"
import type {
  Account,
  AccountTreeNode,
  AccountSummary,
  PartyAccount,
  LedgerEntry,
} from "../types/account"

export function useAccounts() {
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchAccounts = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await accountsService.getAccounts()
      setAccounts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch accounts")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  return { accounts, loading, error, refetch: fetchAccounts }
}

export function useAccountTree() {
  const [tree, setTree] = React.useState<AccountTreeNode[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchTree = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await accountsService.getAccountTree()
      setTree(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch account tree")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchTree()
  }, [fetchTree])

  return { tree, loading, error, refetch: fetchTree }
}

export function usePartyAccounts() {
  const [parties, setParties] = React.useState<PartyAccount[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchParties = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await accountsService.getPartyAccounts()
      setParties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch parties")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchParties()
  }, [fetchParties])

  return { parties, loading, error, refetch: fetchParties }
}

export function useAccountSummary() {
  const [summary, setSummary] = React.useState<AccountSummary | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchSummary = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await accountsService.getAccountSummary()
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch summary")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return { summary, loading, error, refetch: fetchSummary }
}

export function useLedger(accountId: string | null, fromDate?: string, toDate?: string) {
  const [entries, setEntries] = React.useState<LedgerEntry[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchLedger = React.useCallback(async () => {
    if (!accountId) {
      setEntries([])
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await accountsService.getLedger(accountId, fromDate, toDate)
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch ledger")
    } finally {
      setLoading(false)
    }
  }, [accountId, fromDate, toDate])

  React.useEffect(() => {
    fetchLedger()
  }, [fetchLedger])

  return { entries, loading, error, refetch: fetchLedger }
}
