import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import type { CommunicationTableRow } from "./-CommunicationsTable"

export default function useCommunicationsQuery() {
  return useQuery({
    queryKey: ["communications"],
    queryFn: async () => {
      const response = await api.get("/api/communications")
      return response.data.data as CommunicationTableRow[]
    },
  })
}
