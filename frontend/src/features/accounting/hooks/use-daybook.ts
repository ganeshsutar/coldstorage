import * as React from "react"
import { daybookService } from "../api/daybook"
import type { DaybookSummary, DaybookTransaction } from "../types/daybook"

export function useDaybook(date: string) {
  const [summary, setSummary] = React.useState<DaybookSummary | null>(null)
  const [transactions, setTransactions] = React.useState<DaybookTransaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async (transactionType?: string) => {
    try {
      setLoading(true)
      setError(null)
      const [summaryData, transactionsData] = await Promise.all([
        daybookService.getDaybookSummary(date),
        daybookService.getDaybookTransactions(date, transactionType),
      ])
      setSummary(summaryData)
      setTransactions(transactionsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch daybook data")
    } finally {
      setLoading(false)
    }
  }, [date])

  const filterByType = React.useCallback(async (type: string) => {
    try {
      setLoading(true)
      const data = await daybookService.getDaybookTransactions(date, type)
      setTransactions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter transactions")
    } finally {
      setLoading(false)
    }
  }, [date])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    summary,
    transactions,
    loading,
    error,
    refetch: fetchData,
    filterByType,
  }
}
