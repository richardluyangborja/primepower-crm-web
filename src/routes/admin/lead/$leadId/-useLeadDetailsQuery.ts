import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import type { LeadInfoPage } from "."

export default function useLeadDetailsQuery(leadId: string) {
  return useQuery({
    queryKey: ["lead_details", leadId],
    queryFn: async () => {
      const response = await api.get(`/api/leads/${leadId}`)
      return response.data.data as LeadInfoPage
    },
  })
}
