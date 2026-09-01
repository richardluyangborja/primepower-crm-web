import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { updateOpportunity } from "./-api"

export function useSalesRepresentatives() {
  return useQuery({
    queryKey: ["sales-representatives"],
    queryFn: async () => {
      const response = await api.get("/api/sales-representatives")
      return response.data.data as { id: number; name: string }[]
    },
  })
}

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await api.get("/api/companies")
      return response.data.data as { id: number; name: string; industry: string; is_client: boolean }[]
    },
  })
}

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await api.get("/api/leads")
      return response.data.data as { id: number; company: { id: number; name: string } }[]
    },
  })
}

export function useUpdateOpportunity(opportunityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateOpportunityPayload) =>
      updateOpportunity(opportunityId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["opportunities"],
      })
      queryClient.invalidateQueries({
        queryKey: ["opportunity_details", opportunityId],
      })
    },
  })
}
