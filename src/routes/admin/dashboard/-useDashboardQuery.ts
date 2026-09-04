import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export type DashboardData = {
  scope: {
    rep_id: number | null
    from: string | null
    to: string | null
    role: string | null
  }
  summary: {
    total_leads: number
    total_clients: number
    total_opportunities: number
    won_opportunities: number
    lost_opportunities: number
    win_rate: number
    total_contract_value: number
    active_reminders: number
    conversion_rate: number
  }
  leads: {
    by_status: { status: string; count: number }[]
    by_source: { source: string; count: number }[]
    by_month: { month: string; count: number }[]
  }
  clients: {
    active: number
    inactive: number
    by_month: { month: string; count: number }[]
    by_industry: { industry: string; count: number }[]
  }
  opportunities: {
    by_stage: { stage: string; count: number }[]
    value_by_stage: { stage: string; value: number }[]
    monthly_won: { month: string; count: number; total_value: number }[]
    avg_deal_size: number
    total_opportunities: number
    avg_time_in_stage_days: { stage: string; avg_days: number }[]
  }
  communications: {
    total: number
    by_type: { type: string; count: number }[]
    by_direction: { direction: string; count: number }[]
    by_month: { month: string; count: number }[]
  }
  reminders: {
    total: number
    completed: number
    pending: number
    overdue: number
    due_soon: number
    by_priority: { priority: string; count: number }[]
  }
  satisfaction: {
    total_surveys: number
    completed_surveys: number
    pending_surveys: number
    response_rate: number
    average_score: number | null
    score_distribution: { label: string; count: number }[]
    per_rep: {
      rep_id: number | null
      rep_name: string
      surveys: number
      average_score: number | null
    }[]
  }
}

export type DashboardQueryParams = {
  repId?: number
  from?: string
  to?: string
}

export default function useDashboardQuery(params: DashboardQueryParams = {}) {
  return useQuery({
    queryKey: ["dashboard", params],
    queryFn: async () => {
      const response = await api.get("/api/dashboard", {
        params: {
          ...(params.repId ? { rep_id: params.repId } : {}),
          ...(params.from ? { from: params.from } : {}),
          ...(params.to ? { to: params.to } : {}),
        },
      })
      return response.data.data as DashboardData
    },
  })
}
