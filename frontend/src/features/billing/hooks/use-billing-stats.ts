import { useQuery } from "@tanstack/react-query"
import { rentBillService } from "../api/rent-bills"
import { rentBillKeys } from "./use-rent-bills"

export function useBillingStats() {
  return useQuery({
    queryKey: rentBillKeys.stats(),
    queryFn: () => rentBillService.getBillingStats(),
  })
}

export function usePartyOutstanding(partyId: string | null) {
  return useQuery({
    queryKey: rentBillKeys.partyOutstanding(partyId ?? ""),
    queryFn: () => rentBillService.getPartyOutstanding(partyId ?? ""),
    enabled: !!partyId,
  })
}
