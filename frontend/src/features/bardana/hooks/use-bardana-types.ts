import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { bardanaTypeService } from "../api/bardana-types"
import type { BardanaType } from "../types"

export const bardanaTypeKeys = {
  all: ["bardana-types"] as const,
  lists: () => [...bardanaTypeKeys.all, "list"] as const,
  detail: (id: string) => [...bardanaTypeKeys.all, "detail", id] as const,
}

export function useBardanaTypes() {
  return useQuery({
    queryKey: bardanaTypeKeys.lists(),
    queryFn: () => bardanaTypeService.getAll(),
  })
}

export function useCreateBardanaType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<BardanaType>) => bardanaTypeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bardanaTypeKeys.lists() })
    },
  })
}

export function useUpdateBardanaType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BardanaType> }) =>
      bardanaTypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bardanaTypeKeys.lists() })
    },
  })
}

export function useDeleteBardanaType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bardanaTypeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bardanaTypeKeys.lists() })
    },
  })
}
