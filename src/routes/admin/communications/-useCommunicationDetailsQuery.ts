import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import type { CommunicationEntry } from "@/components/communication-history"

export default function useCommunicationDetailsQuery(communicationId: string) {
  return useQuery({
    queryKey: ["communication_details", communicationId],
    queryFn: async () => {
      const response = await api.get(`/api/communications/${communicationId}`)
      return response.data.data as CommunicationEntry
    },
    staleTime: 30_000,
  })
}
