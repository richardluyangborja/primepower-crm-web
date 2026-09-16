import api from "@/lib/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ClientTableRow } from "./-ClientTable"

export type ClientsQueryParams = {
  q?: string
  status?: string
  from?: string
  to?: string
}

function cleanParams(params?: ClientsQueryParams) {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  )
}

export default function useClientsQuery(params?: ClientsQueryParams) {
  const cleaned = cleanParams(params)

  return useQuery({
    queryKey: ["clients", cleaned],
    queryFn: async () => {
      const response = await api.get("/api/clients", { params: cleaned })
      return response.data.data as ClientTableRow[]
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clientId: string | string) => {
      const response = await api.delete(`/api/clients/${clientId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
    },
  })
}
