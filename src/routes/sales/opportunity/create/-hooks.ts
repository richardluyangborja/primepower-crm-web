import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { createOpportunity } from "./-api"

export function useSalesCompanies() {
  return useQuery({
    queryKey: ["sales_companies"],
    queryFn: async () => {
      const response = await api.get("/api/companies/mine")
      return response.data.data as {
        id: number
        name: string
        industry: string
        is_client: boolean
      }[]
    },
  })
}

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await api.get("/api/leads")
      return response.data.data as {
        id: number
        company: { id: number; name: string }
      }[]
    },
  })
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOpportunity,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sales_opportunities"],
      })
    },
  })
}
