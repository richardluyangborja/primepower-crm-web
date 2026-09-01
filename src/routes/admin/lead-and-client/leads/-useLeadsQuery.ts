import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import type { LeadTableRow } from "./-LeadTable"

export default function useLeadsQuery() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await api.get("/api/leads")
      return response.data.data as LeadTableRow[]
    },
  })
}
