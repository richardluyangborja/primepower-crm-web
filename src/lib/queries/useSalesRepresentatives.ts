import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export type SalesRepresentative = {
  id: number
  name: string
}

export default function useSalesRepresentatives() {
  return useQuery({
    queryKey: ["sales_representatives"],
    queryFn: async () => {
      const response = await api.get("/api/sales-representatives")
      return response.data.data as SalesRepresentative[]
    },
  })
}
