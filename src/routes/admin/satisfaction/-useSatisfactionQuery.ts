import api from "@/lib/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  ClientSatisfactionDetail,
  ClientSatisfactionSummary,
  Survey,
} from "../-types"

export function useSatisfactionQuery() {
  return useQuery({
    queryKey: ["satisfaction"],
    queryFn: async () => {
      const response = await api.get("/api/satisfaction")
      return response.data.data as ClientSatisfactionSummary[]
    },
  })
}

export function useSatisfactionDetailQuery(clientId: number) {
  return useQuery({
    queryKey: ["satisfaction_detail", clientId],
    queryFn: async () => {
      const response = await api.get(`/api/satisfaction/${clientId}`)
      return response.data.data as ClientSatisfactionDetail
    },
  })
}

export function useCreateSurvey(clientId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/satisfaction/${clientId}/surveys`)
      return response.data.data as { survey: Survey; link: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["satisfaction"] })
      queryClient.invalidateQueries({
        queryKey: ["satisfaction_detail", clientId],
      })
    },
  })
}

export function useDeleteSurvey(clientId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (surveyId: number) => {
      await api.delete(`/api/satisfaction/${clientId}/surveys/${surveyId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["satisfaction"] })
      queryClient.invalidateQueries({
        queryKey: ["satisfaction_detail", clientId],
      })
    },
  })
}
