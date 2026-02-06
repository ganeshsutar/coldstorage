import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { payPostService } from "../api/masters"
import type { PayPost } from "../types"

export const payPostKeys = {
  all: ["pay-posts"] as const,
  lists: () => [...payPostKeys.all, "list"] as const,
}

export function usePayPosts() {
  return useQuery({
    queryKey: payPostKeys.lists(),
    queryFn: () => payPostService.getAll(),
  })
}

export function useCreatePayPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PayPost>) => payPostService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payPostKeys.lists() })
    },
  })
}

export function useUpdatePayPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PayPost> }) =>
      payPostService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payPostKeys.lists() })
    },
  })
}

export function useDeletePayPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => payPostService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payPostKeys.lists() })
    },
  })
}
