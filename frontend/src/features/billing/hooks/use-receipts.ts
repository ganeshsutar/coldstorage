import * as React from "react"
import { receiptService } from "../api/receipts"
import type { ReceiptFilters } from "../api/receipts"
import type { Receipt, RentBillHeader } from "../types"

export function useReceipts(filters?: ReceiptFilters) {
  const [receipts, setReceipts] = React.useState<Receipt[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchReceipts = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await receiptService.getReceipts(filters)
      setReceipts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch receipts")
    } finally {
      setLoading(false)
    }
  }, [filters])

  React.useEffect(() => {
    fetchReceipts()
  }, [fetchReceipts])

  return { receipts, loading, error, refetch: fetchReceipts }
}

export function useReceiptDetail(id: string | null) {
  const [receipt, setReceipt] = React.useState<Receipt | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchReceipt = React.useCallback(async () => {
    if (!id) {
      setReceipt(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await receiptService.getReceipt(id)
      setReceipt(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch receipt")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchReceipt()
  }, [fetchReceipt])

  return { receipt, loading, error, refetch: fetchReceipt }
}

export function useUnpaidBills(partyId: string | null) {
  const [bills, setBills] = React.useState<RentBillHeader[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchBills = React.useCallback(async () => {
    if (!partyId) {
      setBills([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await receiptService.getUnpaidBillsByParty(partyId)
      setBills(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch unpaid bills")
    } finally {
      setLoading(false)
    }
  }, [partyId])

  React.useEffect(() => {
    fetchBills()
  }, [fetchBills])

  return { bills, loading, error, refetch: fetchBills }
}
