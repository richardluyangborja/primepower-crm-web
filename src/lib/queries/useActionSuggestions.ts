import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"

export type OpportunitySuggestedAction = {
  id: string | null
  type: "stalled" | "closing" | "date" | "review"
  title: string | null
  suggest: string
  reason: string
  value: number
}

type OpportunityMetrics = {
  total_open: number
  total_value: number
  weighted_value: number
  won_count: number
  won_value: number
  lost_count: number
  lost_value: number
  per_stage: { stage: string; label: string; count: number; value: number }[]
  stalled: {
    title: string
    company: string
    stage: string
    days: number
    value: number
    owner: string
  }[]
  closing_soon: {
    title: string
    company: string
    stage: string
    close_date: string
    value: number
    owner: string
  }[]
  top_deals: {
    title: string
    company: string
    stage: string
    close_date: string | null
    value: number
    owner: string
  }[]
  by_owner: { owner: string; count: number; value: number }[]
}

type OpportunityInsights = {
  generated_at: string
  empty: boolean
  metrics: OpportunityMetrics
  suggested_actions: OpportunitySuggestedAction[]
}

export type SatisfactionSuggestedAction = {
  id: string | null
  type: "low_score" | "at_risk" | "pending" | "review"
  title: string | null
  suggest: string
  reason: string
  company: string
}

type SatisfactionMetrics = {
  clients: number
  surveys_sent: number
  surveys_completed: number
  pending_count: number
  response_rate: number
  average_score: number | null
  at_risk_count: number
  score_bands: { band: string; count: number }[]
  by_owner: { owner: string; count: number }[]
  at_risk: {
    company: string
    owner: string
    reason: string
    score: number | null
  }[]
  low_score: { company: string; owner: string; score: number | null }[]
  pending: { company: string; owner: string; count: number }[]
}

type SatisfactionInsights = {
  generated_at: string
  empty: boolean
  metrics: SatisfactionMetrics
  suggested_actions: SatisfactionSuggestedAction[]
}

export type ActionSuggestionsResponse = {
  opportunity: OpportunityInsights
  satisfaction: SatisfactionInsights
}

export function useActionSuggestionsQuery() {
  return useQuery({
    queryKey: ["action-suggestions"],
    queryFn: async () => {
      const { data } = await api.get<{ data: ActionSuggestionsResponse }>(
        "/api/action-suggestions"
      )
      return data.data
    },
  })
}
