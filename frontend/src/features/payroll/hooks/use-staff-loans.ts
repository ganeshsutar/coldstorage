import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { staffLoanService } from "../api/staff-loans"
import type { StaffLoanCreateRequest, StaffLoanFilters } from "../types"

export const staffLoanKeys = {
  all: ["staff-loans"] as const,
  lists: () => [...staffLoanKeys.all, "list"] as const,
  list: (filters?: StaffLoanFilters) => [...staffLoanKeys.lists(), filters] as const,
  details: () => [...staffLoanKeys.all, "detail"] as const,
  detail: (id: string) => [...staffLoanKeys.details(), id] as const,
}

export function useStaffLoans(filters?: StaffLoanFilters) {
  return useQuery({
    queryKey: staffLoanKeys.list(filters),
    queryFn: () => staffLoanService.getAll(filters),
  })
}

export function useStaffLoanDetail(id: string | null) {
  return useQuery({
    queryKey: staffLoanKeys.detail(id!),
    queryFn: () => staffLoanService.get(id!),
    enabled: !!id,
  })
}

export function useCreateStaffLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StaffLoanCreateRequest) => staffLoanService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffLoanKeys.lists() })
    },
  })
}

export function useCancelStaffLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      staffLoanService.cancel(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: staffLoanKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: staffLoanKeys.lists() })
    },
  })
}
