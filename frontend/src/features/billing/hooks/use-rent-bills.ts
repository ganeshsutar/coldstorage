import * as React from "react"
import { rentBillService } from "../api/rent-bills"
import type { RentBillFilters } from "../api/rent-bills"
import type { RentBillHeader, BillableAmad } from "../types"

export function useRentBills(filters?: RentBillFilters) {
  const [bills, setBills] = React.useState<RentBillHeader[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchBills = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await rentBillService.getRentBills(filters)
      setBills(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bills")
    } finally {
      setLoading(false)
    }
  }, [filters])

  React.useEffect(() => {
    fetchBills()
  }, [fetchBills])

  return { bills, loading, error, refetch: fetchBills }
}

export function useRentBillDetail(id: string | null) {
  const [bill, setBill] = React.useState<RentBillHeader | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchBill = React.useCallback(async () => {
    if (!id) {
      setBill(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await rentBillService.getRentBill(id)
      setBill(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bill")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchBill()
  }, [fetchBill])

  return { bill, loading, error, refetch: fetchBill }
}

export function useBillableAmads(partyId?: string) {
  const [amads, setAmads] = React.useState<BillableAmad[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchAmads = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await rentBillService.getBillableAmads(partyId)
      setAmads(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch billable amads")
    } finally {
      setLoading(false)
    }
  }, [partyId])

  React.useEffect(() => {
    fetchAmads()
  }, [fetchAmads])

  return { amads, loading, error, refetch: fetchAmads }
}
