import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { deductionService } from "../api/masters"
import type { Deduction } from "../types"

export const deductionKeys = {
  all: ["deductions"] as const,
  lists: () => [...deductionKeys.all, "list"] as const,
}

export function useDeductions() {
  return useQuery({
    queryKey: deductionKeys.lists(),
    queryFn: () => deductionService.getAll(),
  })
}

export function useCreateDeduction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Deduction>) => deductionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deductionKeys.lists() })
    },
  })
}

export function useUpdateDeduction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Deduction> }) =>
      deductionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deductionKeys.lists() })
    },
  })
}

export function useDeleteDeduction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deductionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deductionKeys.lists() })
    },
  })
}
