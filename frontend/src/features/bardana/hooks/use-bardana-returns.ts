import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { bardanaReturnService } from "../api/bardana-returns"
import type { BardanaReturnCreateRequest, BardanaReturnFilters } from "../types"
import { bardanaStatsKeys } from "./use-bardana-stats"

export const bardanaReturnKeys = {
  all: ["bardana-returns"] as const,
  lists: () => [...bardanaReturnKeys.all, "list"] as const,
  list: (filters?: BardanaReturnFilters) => [...bardanaReturnKeys.lists(), filters] as const,
  details: () => [...bardanaReturnKeys.all, "detail"] as const,
  detail: (id: string) => [...bardanaReturnKeys.details(), id] as const,
}

export function useBardanaReturns(filters?: BardanaReturnFilters) {
  return useQuery({
    queryKey: bardanaReturnKeys.list(filters),
    queryFn: () => bardanaReturnService.getAll(filters),
  })
}

export function useBardanaReturnDetail(id: string | null) {
  return useQuery({
    queryKey: bardanaReturnKeys.detail(id ?? ""),
    queryFn: () => bardanaReturnService.get(id ?? ""),
    enabled: !!id,
  })
}

export function useCreateBardanaReturn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BardanaReturnCreateRequest) => bardanaReturnService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bardanaReturnKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bardanaStatsKeys.all })
    },
  })
}

export function useConfirmBardanaReturn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bardanaReturnService.confirm(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: bardanaReturnKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: bardanaReturnKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bardanaStatsKeys.all })
    },
  })
}

export function useCancelBardanaReturn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      bardanaReturnService.cancel(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: bardanaReturnKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: bardanaReturnKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bardanaStatsKeys.all })
    },
  })
}
