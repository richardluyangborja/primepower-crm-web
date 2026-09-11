import api from "@/lib/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { LeadTableRow } from "./-LeadTable"

export type LeadsQueryParams = {
  q?: string
  status?: string
  source?: string
  from?: string
  to?: string
  exclude_converted?: boolean | string
}

function cleanParams(params?: LeadsQueryParams) {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(
      ([, v]) => v !== undefined && v !== null && v !== "" && v !== false,
    ),
  )
}

export default function useLeadsQuery(params?: LeadsQueryParams) {
  const cleaned = cleanParams(params)

  return useQuery({
    queryKey: ["leads", cleaned],
    queryFn: async () => {
      const response = await api.get("/api/leads", { params: cleaned })
      return response.data.data as LeadTableRow[]
    },
  })
}

export function useLeadSourcesQuery() {
  return useQuery({
    queryKey: ["leads", "sources"],
    queryFn: async () => {
      const response = await api.get("/api/leads/sources")
      return response.data.data as string[]
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (leadId: number | string) => {
      const response = await api.delete(`/api/leads/${leadId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] })
    },
  })
}