import { useQuery } from "@tanstack/react-query"
import { bardanaStatsService } from "../api/bardana-stats"
import type { PartyOutstanding } from "../types"

export const bardanaStatsKeys = {
  all: ["bardana-stats"] as const,
  stockSummary: () => [...bardanaStatsKeys.all, "stock-summary"] as const,
  partyOutstanding: (partyId?: string) =>
    [...bardanaStatsKeys.all, "party-outstanding", partyId] as const,
  allPartyOutstanding: () => [...bardanaStatsKeys.all, "all-party-outstanding"] as const,
}

export function useStockSummary() {
  return useQuery({
    queryKey: bardanaStatsKeys.stockSummary(),
    queryFn: () => bardanaStatsService.getStockSummary(),
  })
}

export function usePartyOutstandingList() {
  return useQuery({
    queryKey: bardanaStatsKeys.allPartyOutstanding(),
    queryFn: () => bardanaStatsService.getAllPartyOutstanding(),
  })
}

export function usePartyOutstandingDetail(partyId: string | null) {
  return useQuery({
    queryKey: bardanaStatsKeys.partyOutstanding(partyId!),
    queryFn: () => bardanaStatsService.getPartyOutstanding(partyId!) as Promise<PartyOutstanding>,
    enabled: !!partyId,
  })
}
