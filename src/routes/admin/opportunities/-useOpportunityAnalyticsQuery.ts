import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export default function useOpportunityAnalyticsQuery() {
  return useQuery({
    queryKey: ["analytics", "opportunities"],
    queryFn: async () => {
      const response = await api.get("/api/analytics/opportunities")
      return response.data.data as OpportunityAnalyticsInsights
    },
  })
}

export type OpportunityAnalyticsItem = {
  title: string
  company: string
  stage: string
  days: number | null
  close_date: string | null
  value: number
  owner: string
}

export type OpportunityAnalyticsOwner = {
  owner: string
  count: number
  value: number
}

export type OpportunityAnalyticsAction = {
  type: "stalled" | "closing" | "date" | "review"
  title: string | null
  suggest: string
  reason: string
  value: number
}

export type OpportunityAnalyticsMetrics = {
  total_open: number
  total_value: number
  weighted_value: number
  won_count: number
  won_value: number
  lost_count: number
  lost_value: number
  per_stage: { stage: string; label: string; count: number; value: number }[]
  stalled: OpportunityAnalyticsItem[]
  closing_soon: OpportunityAnalyticsItem[]
  top_deals: OpportunityAnalyticsItem[]
  by_owner: OpportunityAnalyticsOwner[]
}

export type OpportunityAnalyticsInsights = {
  generated_at: string
  empty: boolean
  metrics: OpportunityAnalyticsMetrics
  suggested_actions: OpportunityAnalyticsAction[]
}
