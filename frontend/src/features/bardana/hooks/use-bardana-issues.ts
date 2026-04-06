import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { bardanaIssueService } from "../api/bardana-issues"
import type { BardanaIssueCreateRequest, BardanaIssueFilters } from "../types"
import { bardanaStatsKeys } from "./use-bardana-stats"

export const bardanaIssueKeys = {
  all: ["bardana-issues"] as const,
  lists: () => [...bardanaIssueKeys.all, "list"] as const,
  list: (filters?: BardanaIssueFilters) => [...bardanaIssueKeys.lists(), filters] as const,
  details: () => [...bardanaIssueKeys.all, "detail"] as const,
  detail: (id: string) => [...bardanaIssueKeys.details(), id] as const,
}

export function useBardanaIssues(filters?: BardanaIssueFilters) {
  return useQuery({
    queryKey: bardanaIssueKeys.list(filters),
    queryFn: () => bardanaIssueService.getAll(filters),
  })
}

export function useBardanaIssueDetail(id: string | null) {
  return useQuery({
    queryKey: bardanaIssueKeys.detail(id ?? ""),
    queryFn: () => bardanaIssueService.get(id ?? ""),
    enabled: !!id,
  })
}

export function useCreateBardanaIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BardanaIssueCreateRequest) => bardanaIssueService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bardanaIssueKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bardanaStatsKeys.all })
    },
  })
}

export function useConfirmBardanaIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bardanaIssueService.confirm(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: bardanaIssueKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: bardanaIssueKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bardanaStatsKeys.all })
    },
  })
}

export function useCancelBardanaIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      bardanaIssueService.cancel(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: bardanaIssueKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: bardanaIssueKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bardanaStatsKeys.all })
    },
  })
}
