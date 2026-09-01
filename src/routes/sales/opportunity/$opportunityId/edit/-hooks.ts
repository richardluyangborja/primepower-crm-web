import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { updateOpportunity } from "./-api"

export function useSalesCompanies() {
  return useQuery({
    queryKey: ["sales_companies"],
    queryFn: async () => {
      const response = await api.get("/api/companies/mine")
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
        queryKey: ["sales_opportunities"],
      })
      queryClient.invalidateQueries({
        queryKey: ["sales_opportunity_details", opportunityId],
      })
    },
  })
}

type CreateOpportunityPayload = {
  company_id: number
  lead_id: number | null
  title: string
  description: string
  manpower_requirement: number | null
  estimated_contract_value: number | null
  expected_close_date: string | null
}
