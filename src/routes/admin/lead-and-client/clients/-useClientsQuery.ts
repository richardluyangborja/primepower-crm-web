import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import type { ClientTableRow } from "./-ClientTable"

export default function useClientsQuery() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await api.get("/api/clients")
      return response.data.data as ClientTableRow[]
    },
  })
}
