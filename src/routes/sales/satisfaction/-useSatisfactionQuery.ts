import api from "@/lib/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  ClientSatisfactionDetail,
  Survey,
  ClientSatisfactionSummary,
} from "@/routes/admin/satisfaction/-types"

export type SatisfactionFilters = {
  q?: string
  trend?: string
  score?: string
  from?: string
  to?: string
}

export function useSatisfactionQuery(filters: SatisfactionFilters = {}) {
  return useQuery({
    queryKey: ["sales_satisfaction", filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters.q) params.q = filters.q
      if (filters.trend && filters.trend !== "all") params.trend = filters.trend
      if (filters.score && filters.score !== "all") params.score = filters.score
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to
      const response = await api.get("/api/satisfaction/mine", { params })
      return response.data.data as ClientSatisfactionSummary[]
    },
  })
}

export function useSatisfactionDetailQuery(clientId: string) {
  return useQuery({
    queryKey: ["sales_satisfaction_detail", clientId],
    queryFn: async () => {
      const response = await api.get(`/api/satisfaction/${clientId}`)
      return response.data.data as ClientSatisfactionDetail
    },
  })
}

export function useCreateSurvey(clientId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/satisfaction/${clientId}/surveys`)
      return response.data.data as { survey: Survey; link: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales_satisfaction"] })
      queryClient.invalidateQueries({
        queryKey: ["sales_satisfaction_detail", clientId],
      })
    },
  })
}

export function useDeleteSurvey(clientId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (surveyId: string) => {
      await api.delete(`/api/satisfaction/${clientId}/surveys/${surveyId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales_satisfaction"] })
      queryClient.invalidateQueries({
        queryKey: ["sales_satisfaction_detail", clientId],
      })
    },
  })
}
