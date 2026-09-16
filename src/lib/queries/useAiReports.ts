import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export type AiReportType =
  "business_health" | "rep_performance" | "opportunity" | "satisfaction"

export type AiReportDateRange = "this_week" | "last_month" | "custom"

export type AiReport = {
  id: string
  type: AiReportType
  type_label: string
  date_range: AiReportDateRange
  from_date: string | null
  to_date: string | null
  content: string
  user_name: string | null
  created_at: string
  updated_at: string
}

export type AiReportsResponse = {
  data: AiReport[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    path: string
    per_page: number
    to: number
    total: number
  }
}

export function useAiReportsQuery() {
  return useQuery({
    queryKey: ["ai_reports"],
    queryFn: async () => {
      const { data } = await api.get<AiReportsResponse>("/api/ai-reports")
      return data.data
    },
  })
}

export function aiReportRangeLabel(
  report: Pick<AiReport, "date_range" | "from_date" | "to_date">
): string {
  if (report.date_range === "custom") {
    return `${report.from_date} to ${report.to_date}`
  }
  return report.date_range === "this_week" ? "This Week" : "Last Month"
}

export function useGenerateAiReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      type: AiReportType
      date_range: AiReportDateRange
      from_date?: string
      to_date?: string
    }) => {
      const { data } = await api.post<{ data: AiReport }>(
        "/api/ai-reports",
        params
      )
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_reports"] })
    },
  })
}

export function useDeleteAiReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/ai-reports/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_reports"] })
    },
  })
}
