import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { createOpportunity } from "./-api"

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await api.get("/api/companies")
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
        queryKey: ["opportunities"],
      })
    },
  })
}
