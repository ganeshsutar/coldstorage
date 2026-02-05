import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { receiptService } from "../api/receipts"
import type { ReceiptFilters } from "../api/receipts"
import type { ReceiptCreateRequest } from "../types"
import { rentBillKeys } from "./use-rent-bills"

// Query keys for cache management
export const receiptKeys = {
  all: ["receipts"] as const,
  lists: () => [...receiptKeys.all, "list"] as const,
  list: (filters?: ReceiptFilters) => [...receiptKeys.lists(), filters] as const,
  details: () => [...receiptKeys.all, "detail"] as const,
  detail: (id: string) => [...receiptKeys.details(), id] as const,
  unpaidBills: (partyId: string) => [...receiptKeys.all, "unpaid-bills", partyId] as const,
}

export function useReceipts(filters?: ReceiptFilters) {
  return useQuery({
    queryKey: receiptKeys.list(filters),
    queryFn: () => receiptService.getReceipts(filters),
  })
}

export function useReceiptDetail(id: string | null) {
  return useQuery({
    queryKey: receiptKeys.detail(id!),
    queryFn: () => receiptService.getReceipt(id!),
    enabled: !!id,
  })
}

export function useUnpaidBills(partyId: string | null) {
  return useQuery({
    queryKey: receiptKeys.unpaidBills(partyId!),
    queryFn: () => receiptService.getUnpaidBillsByParty(partyId!),
    enabled: !!partyId,
  })
}

export function useCreateReceipt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ReceiptCreateRequest) => receiptService.createReceipt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() })
      queryClient.invalidateQueries({ queryKey: rentBillKeys.lists() })
      queryClient.invalidateQueries({ queryKey: rentBillKeys.stats() })
    },
  })
}

export function useConfirmReceipt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => receiptService.confirmReceipt(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() })
      queryClient.invalidateQueries({ queryKey: rentBillKeys.lists() })
      queryClient.invalidateQueries({ queryKey: rentBillKeys.stats() })
    },
  })
}

export function useCancelReceipt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      receiptService.cancelReceipt(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() })
      queryClient.invalidateQueries({ queryKey: rentBillKeys.lists() })
      queryClient.invalidateQueries({ queryKey: rentBillKeys.stats() })
    },
  })
}
