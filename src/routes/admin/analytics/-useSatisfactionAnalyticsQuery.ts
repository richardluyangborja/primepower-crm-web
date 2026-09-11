import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export default function useSatisfactionAnalyticsQuery() {
  return useQuery({
    queryKey: ["analytics", "satisfaction"],
    queryFn: async () => {
      const response = await api.get("/api/analytics/satisfaction")
      return response.data.data as SatisfactionAnalyticsInsights
    },
  })
}

export type ScoreBand = { band: "High" | "Medium" | "Low"; count: number }

export type SatisfactionOwnerCount = { owner: string; count: number }

export type AtRiskClient = {
  company: string
  owner: string
  reason: string
  score: number | null
}

export type LowScoreClient = { company: string; owner: string; score: number }

export type PendingSurveyClient = {
  company: string
  owner: string
  count: number
}

export type SatisfactionAnalyticsAction = {
  type: "low_score" | "at_risk" | "pending" | "review"
  title: string | null
  suggest: string
  reason: string
  company: string
}

export type SatisfactionAnalyticsMetrics = {
  clients: number
  surveys_sent: number
  surveys_completed: number
  pending_count: number
  response_rate: number
  average_score: number | null
  at_risk_count: number
  score_bands: ScoreBand[]
  by_owner: SatisfactionOwnerCount[]
  at_risk: AtRiskClient[]
  low_score: LowScoreClient[]
  pending: PendingSurveyClient[]
}

export type SatisfactionAnalyticsInsights = {
  generated_at: string
  empty: boolean
  metrics: SatisfactionAnalyticsMetrics
  suggested_actions: SatisfactionAnalyticsAction[]
}
