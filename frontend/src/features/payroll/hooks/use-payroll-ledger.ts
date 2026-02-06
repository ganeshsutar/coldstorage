import { useQuery } from "@tanstack/react-query"
import { payrollLedgerService } from "../api/payroll-ledger"
import type { PayrollLedgerFilters } from "../types"

export const payrollLedgerKeys = {
  all: ["payroll-ledger"] as const,
  lists: () => [...payrollLedgerKeys.all, "list"] as const,
  list: (filters?: PayrollLedgerFilters) => [...payrollLedgerKeys.lists(), filters] as const,
}

export function usePayrollLedger(filters?: PayrollLedgerFilters) {
  return useQuery({
    queryKey: payrollLedgerKeys.list(filters),
    queryFn: () => payrollLedgerService.getAll(filters),
  })
}
