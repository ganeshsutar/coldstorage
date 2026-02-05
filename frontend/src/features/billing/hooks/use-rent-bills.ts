import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { rentBillService } from "../api/rent-bills"
import type { RentBillFilters } from "../api/rent-bills"
import type { RentBillCreateRequest } from "../types"

// Query keys for cache management
export const rentBillKeys = {
  all: ["rent-bills"] as const,
  lists: () => [...rentBillKeys.all, "list"] as const,
  list: (filters?: RentBillFilters) => [...rentBillKeys.lists(), filters] as const,
  details: () => [...rentBillKeys.all, "detail"] as const,
  detail: (id: string) => [...rentBillKeys.details(), id] as const,
  billableAmads: (partyId?: string) => [...rentBillKeys.all, "billable-amads", partyId] as const,
  stats: () => [...rentBillKeys.all, "stats"] as const,
  partyOutstanding: (partyId: string) => [...rentBillKeys.all, "party-outstanding", partyId] as const,
}

export function useRentBills(filters?: RentBillFilters) {
  return useQuery({
    queryKey: rentBillKeys.list(filters),
    queryFn: () => rentBillService.getRentBills(filters),
  })
}

export function useRentBillDetail(id: string | null) {
  return useQuery({
    queryKey: rentBillKeys.detail(id!),
    queryFn: () => rentBillService.getRentBill(id!),
    enabled: !!id,
  })
}

export function useBillableAmads(partyId?: string) {
  return useQuery({
    queryKey: rentBillKeys.billableAmads(partyId),
    queryFn: () => rentBillService.getBillableAmads(partyId),
  })
}

export function useCreateRentBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RentBillCreateRequest) => rentBillService.createRentBill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rentBillKeys.lists() })
      queryClient.invalidateQueries({ queryKey: rentBillKeys.stats() })
      queryClient.invalidateQueries({ queryKey: ["rent-bills", "billable-amads"] })
    },
  })
}

export function useConfirmRentBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rentBillService.confirmRentBill(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: rentBillKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: rentBillKeys.lists() })
      queryClient.invalidateQueries({ queryKey: rentBillKeys.stats() })
    },
  })
}

export function useCancelRentBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rentBillService.cancelRentBill(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: rentBillKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: rentBillKeys.lists() })
      queryClient.invalidateQueries({ queryKey: rentBillKeys.stats() })
      queryClient.invalidateQueries({ queryKey: ["rent-bills", "billable-amads"] })
    },
  })
}
