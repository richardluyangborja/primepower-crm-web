import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export default function useOpportunitiesQuery() {
  return useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await api.get("/api/opportunities")
      return response.data.data as Opportunity[]
    },
  })
}
