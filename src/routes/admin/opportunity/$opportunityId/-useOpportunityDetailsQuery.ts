import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import type { OpportunityInfoPage } from "."

export default function useOpportunityDetailsQuery(opportunityId: string) {
  return useQuery({
    queryKey: ["opportunity_details", opportunityId],
    queryFn: async () => {
      const response = await api.get(`/api/opportunities/${opportunityId}`)
      return response.data.data as OpportunityInfoPage
    },
  })
}
