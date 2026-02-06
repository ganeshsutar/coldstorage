import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { attendanceService } from "../api/attendance"
import type { SalaryProcessRequest } from "../types"
import { attendanceKeys } from "./use-attendance"

export const salarySheetKeys = {
  all: ["salary-sheet"] as const,
  sheet: (month: number, year: number) => [...salarySheetKeys.all, month, year] as const,
}

export function useProcessSalary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SalaryProcessRequest) => attendanceService.processSalary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: salarySheetKeys.all })
    },
  })
}

export function useSalarySheet(month: number, year: number) {
  return useQuery({
    queryKey: salarySheetKeys.sheet(month, year),
    queryFn: () => attendanceService.getSalarySheet(month, year),
    enabled: month > 0 && year > 0,
  })
}
