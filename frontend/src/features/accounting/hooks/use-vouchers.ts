import * as React from "react"
import { vouchersService } from "../api/vouchers"
import type { Voucher, VoucherType } from "../types/voucher"

export function useVouchers(type?: VoucherType | "all") {
  const [vouchers, setVouchers] = React.useState<Voucher[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = type && type !== "all" ? { type } : undefined
      const data = await vouchersService.getVouchers(params)
      setVouchers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vouchers")
    } finally {
      setLoading(false)
    }
  }, [type])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    vouchers,
    loading,
    error,
    refetch: fetchData,
  }
}
