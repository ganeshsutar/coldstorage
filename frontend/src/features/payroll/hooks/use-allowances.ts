import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { allowanceService } from "../api/masters"
import type { Allowance } from "../types"

export const allowanceKeys = {
  all: ["allowances"] as const,
  lists: () => [...allowanceKeys.all, "list"] as const,
}

export function useAllowances() {
  return useQuery({
    queryKey: allowanceKeys.lists(),
    queryFn: () => allowanceService.getAll(),
  })
}

export function useCreateAllowance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Allowance>) => allowanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: allowanceKeys.lists() })
    },
  })
}

export function useUpdateAllowance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Allowance> }) =>
      allowanceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: allowanceKeys.lists() })
    },
  })
}

export function useDeleteAllowance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => allowanceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: allowanceKeys.lists() })
    },
  })
}
