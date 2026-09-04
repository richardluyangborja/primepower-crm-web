import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import type { CommunicationTableRow } from "./-CommunicationsTable"

export type CommunicationsQueryParams = {
  type?: string
  direction?: "incoming" | "outgoing"
  outcome?: string
  from?: string
  to?: string
  q?: string
}

export default function useCommunicationsQuery(
  params?: CommunicationsQueryParams,
) {
  const cleaned = Object.fromEntries(
    Object.entries(params ?? {}).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  )

  return useQuery({
    queryKey: ["sales_communications", cleaned],
    queryFn: async () => {
      const response = await api.get("/api/communications/mine", {
        params: cleaned,
      })
      return response.data.data as CommunicationTableRow[]
    },
  })
}
