import { useQuery } from "@tanstack/react-query"
import { payrollStatsService } from "../api/masters"

export const payrollStatsKeys = {
  all: ["payroll-stats"] as const,
}

export function usePayrollStats() {
  return useQuery({
    queryKey: payrollStatsKeys.all,
    queryFn: () => payrollStatsService.getStats(),
  })
}
