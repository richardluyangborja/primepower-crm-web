import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import type { ClientInfoPage } from "."

export default function useClientDetailsQuery(clientId: string) {
  return useQuery({
    queryKey: ["client_details", clientId],
    queryFn: async () => {
      const response = await api.get(`/api/clients/${clientId}`)
      return response.data.data as ClientInfoPage
    },
  })
}
