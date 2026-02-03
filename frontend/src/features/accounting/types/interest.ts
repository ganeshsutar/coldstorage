export type ComponentType = "rent" | "loan" | "bardana" | "other"

export interface InterestCalculationParams {
  from_date: string
  to_date: string
  rate: number
  days_in_year: 360 | 365
  party_selection: "all" | "selected"
  selected_party_ids?: string[]
  components: ComponentType[]
}

export interface InterestBreakdown {
  component: ComponentType
  principal: number
  interest: number
}

export interface PartyInterestResult {
  party_id: string
  party_name: string
  party_code: string
  principal: number
  days: number
  rate: number
  interest: number
  breakdown: InterestBreakdown[]
}

export interface InterestCalculationResult {
  params: InterestCalculationParams
  results: PartyInterestResult[]
  total_principal: number
  total_interest: number
  calculated_at: string
}

export interface PendingInterest {
  party_id: string
  party_name: string
  party_code: string
  pending_amount: number
  last_posted_date: string | null
}

export interface PostInterestRequest {
  calculation_id: string
  post_date: string
}
