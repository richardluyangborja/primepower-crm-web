import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export type DashboardData = {
  summary: {
    total_leads: number
    total_clients: number
    total_opportunities: number
    won_opportunities: number
    total_contract_value: number
    active_reminders: number
    conversion_rate: number
  }
  leads: {
    by_status: { status: string; count: number }[]
    by_month: { month: string; count: number }[]
    by_source: { source: string; count: number }[]
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
    average_score: number | null
    score_distribution: { label: string; count: number }[]
  }
}

export default function useDashboardQuery() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await api.get("/api/dashboard")
      return response.data.data as DashboardData
    },
  })
}
